#!/usr/bin/env python3
"""Check CSS custom properties against their definitions and the docs.

Run from the repository root:

    python3 .claude/skills/audit-docs/check-tokens.py [--quiet]

Reports five things:

  UNDEFINED  var(--x) with no declaration anywhere. This is a real defect: an
             undefined custom property does not raise an error, the declaration
             is dropped and the property falls back to its initial value.
  LITERAL    A #hex, rgb() or hsl() color written outside styles/tokens/. Also a
             defect: every color belongs to the palette in tokens/colors.css, so
             a literal one is invisible to a theme change and to this audit.
  DEAD       Declared in styles/tokens/ but never referenced.
  DOC-ONLY   Named in a doc but not declared as a global token.
  LOCAL      Declared inside a selector outside tokens/. Legitimate — scoped
             custom properties like --rot belong on the element, not in the
             global layer. Listed so they are not mistaken for UNDEFINED.

--quiet suppresses everything except the two defect groups, and prints nothing
at all when there are none. It does not change the exit code.

Exit code is 1 when an UNDEFINED reference or a LITERAL color exists, else 0.
"""

import argparse
import glob
import os
import re
import sys

TOKEN_DIR = os.path.join("src", "styles", "tokens")
CSS_GLOB = os.path.join("src", "styles", "**", "*.css")
DOCS = ["CLAUDE.md", "DESIGN.md", "README.md"] + sorted(
    glob.glob(os.path.join(".claude", "rules", "*.md"))
)

# Everything that can put a color on the page: stylesheets, the markup, and the
# renderers that write style through the CSSOM. Docs are excluded on purpose —
# they quote hex values to describe the palette.
COLOR_GLOBS = [
    os.path.join("src", "**", "*.css"),
    os.path.join("src", "**", "*.ts"),
    "index.html",
]

BLOCK_COMMENT = re.compile(r"/\*.*?\*/", re.S)
HTML_COMMENT = re.compile(r"<!--.*?-->", re.S)
# Not preceded by ':' so the '//' in an https:// URL survives.
LINE_COMMENT = re.compile(r"(?<!:)//[^\n]*")

DECL = re.compile(r"(--[a-z0-9-]+)\s*:")
USE = re.compile(r"var\(\s*(--[a-z0-9-]+)")
DOC_REF = re.compile(r"`(--[a-z0-9-]+)`")

# Only real color shapes: 3, 4, 6 or 8 hex digits, and the trailing \b keeps
# '#abcxyz' or an id selector from matching. Length 5 and 7 are not colors.
COLOR = re.compile(
    r"#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})\b"
    r"|\b(?:rgba?|hsla?)\([^)]*\)"
)


def in_token_dir(path):
    return os.path.normpath(path).startswith(TOKEN_DIR + os.sep)


def blank_comments(text, path):
    """Replace comment bodies with spaces, keeping line numbers intact."""
    blank = lambda m: re.sub(r"[^\n]", " ", m.group(0))
    text = BLOCK_COMMENT.sub(blank, text)
    if path.endswith(".html"):
        text = HTML_COMMENT.sub(blank, text)
    if path.endswith(".ts"):
        text = LINE_COMMENT.sub(blank, text)
    return text


def source_paths():
    paths = set(glob.glob(CSS_GLOB, recursive=True))
    for pattern in COLOR_GLOBS:
        paths.update(glob.glob(pattern, recursive=True))
    return sorted(paths)


def scan_sources():
    """Return (global_tokens, local_props, uses, literals).

    Declarations only count from CSS — a '--x:' in TypeScript is a CSSOM write,
    not the global layer. References and literal colors count from every source
    file, because a renderer reaches for a token, and hardcodes a color, just as
    readily as a stylesheet does.
    """
    global_tokens, local_props, uses, literals = {}, {}, {}, []
    for path in source_paths():
        is_css = path.endswith(".css")
        is_token_file = in_token_dir(path)
        with open(path, encoding="utf-8") as fh:
            clean = blank_comments(fh.read(), path)
        for lineno, line in enumerate(clean.splitlines(), 1):
            where = f"{path}:{lineno}"
            if is_css:
                for name in DECL.findall(line):
                    target = global_tokens if is_token_file else local_props
                    target.setdefault(name, []).append(where)
            for name in USE.findall(line):
                uses.setdefault(name, []).append(where)
            if not is_token_file:
                for literal in COLOR.findall(line):
                    literals.append((literal, where))
    return global_tokens, local_props, uses, literals


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
        label = name if len(name) <= 30 else name[:29] + "…"
        print(f"  {label:<32} {where}")


def main():
    parser = argparse.ArgumentParser(
        description="Audit CSS custom properties and literal colors."
    )
    parser.add_argument(
        "--quiet",
        action="store_true",
        help="print only the defect groups, and nothing when there are none",
    )
    args = parser.parse_args()

    if not os.path.isdir(TOKEN_DIR):
        sys.exit(f"error: {TOKEN_DIR} not found — run this from the repo root")

    global_tokens, local_props, uses, literals = scan_sources()
    doc_refs = scan_docs()
    declared = set(global_tokens) | set(local_props)

    undefined = sorted((n, w[0]) for n, w in uses.items() if n not in declared)
    dead = sorted((n, w[0]) for n, w in global_tokens.items() if n not in uses)
    doc_only = sorted((n, w[0]) for n, w in doc_refs.items() if n not in global_tokens)
    local = sorted((n, w[0]) for n, w in local_props.items())

    defects = bool(undefined or literals)

    if args.quiet:
        if not defects:
            return 0
        if undefined:
            section("UNDEFINED — used but never declared (defect)", undefined)
        if literals:
            section("LITERAL — color written outside tokens/ (defect)", literals)
        return 1

    section("UNDEFINED — used but never declared (defect)", undefined)
    section("LITERAL — color written outside tokens/ (defect)", literals)
    section("DEAD — declared in tokens/ but never used", dead)
    section("DOC-ONLY — named in a doc, not a global token", doc_only)
    section("LOCAL — scoped to a selector, not a global token (expected)", local)

    print(
        f"\n{len(global_tokens)} global tokens, {len(local_props)} local properties, "
        f"{len(uses)} distinct references, {len(literals)} literal colors."
    )
    if defects:
        print("\nDefects above must be fixed. Everything else needs judgement:")
        print("  - a DEAD token may be deliberate reserve; ask before pruning")
        print("  - a DOC-ONLY name may be a scoped property or a cautionary example")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
