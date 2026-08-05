#!/usr/bin/env python3
"""Check CSS custom properties against their definitions and the docs.

Run from the repository root:

    python3 .claude/skills/audit-docs/check-tokens.py

Reports four things:

  UNDEFINED  var(--x) with no declaration anywhere. This is a real defect: an
             undefined custom property does not raise an error, the declaration
             is dropped and the property falls back to its initial value.
  DEAD       Declared in styles/tokens/ but never referenced.
  DOC-ONLY   Named in a doc but not declared as a global token.
  LOCAL      Declared inside a selector outside tokens/. Legitimate — scoped
             custom properties like --rot belong on the element, not in the
             global layer. Listed so they are not mistaken for UNDEFINED.

Exit code is 1 when an UNDEFINED reference exists, otherwise 0.
"""

import glob
import os
import re
import sys

TOKEN_DIR = os.path.join("src", "styles", "tokens")
CSS_GLOB = os.path.join("src", "styles", "**", "*.css")
DOCS = ["CLAUDE.md", "DESIGN.md", "README.md"] + sorted(
    glob.glob(os.path.join(".claude", "rules", "*.md"))
)

COMMENT = re.compile(r"/\*.*?\*/", re.S)
DECL = re.compile(r"(--[a-z0-9-]+)\s*:")
USE = re.compile(r"var\(\s*(--[a-z0-9-]+)")
DOC_REF = re.compile(r"`(--[a-z0-9-]+)`")


def scan_css():
    """Return (global_tokens, local_props, uses) keyed by token name."""
    global_tokens, local_props, uses = {}, {}, {}
    for path in sorted(glob.glob(CSS_GLOB, recursive=True)):
        is_token_file = os.path.dirname(path).endswith(os.path.basename(TOKEN_DIR))
        with open(path, encoding="utf-8") as fh:
            raw = fh.read()
        # Blank out comments but keep line numbers intact.
        clean = COMMENT.sub(lambda m: re.sub(r"[^\n]", " ", m.group(0)), raw)
        for lineno, line in enumerate(clean.splitlines(), 1):
            where = f"{path}:{lineno}"
            for name in DECL.findall(line):
                target = global_tokens if is_token_file else local_props
                target.setdefault(name, []).append(where)
            for name in USE.findall(line):
                uses.setdefault(name, []).append(where)
    return global_tokens, local_props, uses


def scan_docs():
    refs = {}
    for path in DOCS:
        if not os.path.exists(path):
            continue
        with open(path, encoding="utf-8") as fh:
            for lineno, line in enumerate(fh, 1):
                for name in DOC_REF.findall(line):
                    refs.setdefault(name, []).append(f"{path}:{lineno}")
    return refs


def section(title, rows):
    print(f"\n{title}")
    if not rows:
        print("  none")
        return
    for name, where in rows:
        print(f"  {name:<22} {where}")


def main():
    if not os.path.isdir(TOKEN_DIR):
        sys.exit(f"error: {TOKEN_DIR} not found — run this from the repo root")

    global_tokens, local_props, uses = scan_css()
    doc_refs = scan_docs()
    declared = set(global_tokens) | set(local_props)

    undefined = sorted(
        (n, w[0]) for n, w in uses.items() if n not in declared
    )
    dead = sorted((n, w[0]) for n, w in global_tokens.items() if n not in uses)
    doc_only = sorted(
        (n, w[0])
        for n, w in doc_refs.items()
        if n not in global_tokens
    )
    local = sorted((n, w[0]) for n, w in local_props.items())

    section("UNDEFINED — used but never declared (defect)", undefined)
    section("DEAD — declared in tokens/ but never used", dead)
    section("DOC-ONLY — named in a doc, not a global token", doc_only)
    section("LOCAL — scoped to a selector, not a global token (expected)", local)

    print(
        f"\n{len(global_tokens)} global tokens, {len(local_props)} local properties, "
        f"{len(uses)} distinct references."
    )
    if undefined:
        print("\nUNDEFINED references are defects. Everything else needs judgement:")
        print("  - a DEAD token may be deliberate reserve; ask before pruning")
        print("  - a DOC-ONLY name may be a scoped property or a cautionary example")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
