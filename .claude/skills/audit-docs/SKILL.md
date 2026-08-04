---
name: audit-docs
description: >
  Audit this repository's documentation against the code that actually ships.
  Verifies every factual claim in CLAUDE.md, DESIGN.md, README.md and
  .claude/rules/ against real files with file:line evidence, classifies each
  claim as accurate, stale, violated, or needing a human decision, and flags the
  reverse case where code contradicts a documented rule. Use before trusting an
  architecture or design doc, after a refactor that changed structure or
  dependencies, or whenever the docs are suspected of having drifted.
disable-model-invocation: true
---

# Audit docs against code

Produce a report. **Do not edit any file** until the user approves the report.

## 1. Collect the claims

Read every document that instructs an agent or a developer: `CLAUDE.md`,
`DESIGN.md`, `README.md`, `.claude/rules/*.md`, `.claude/skills/*/SKILL.md`.

Break each into individual checkable claims. One sentence carrying three facts is
three claims. Skip prose that asserts nothing ("we care about quality").

## 2. Verify each claim against the code

Find evidence in the repository for every claim. Never accept one because it
sounds plausible — in a stale document the dangerous lines are the reasonable
sounding ones, not the obviously broken ones.

Where to look:

- commands, scripts, verify gates → `package.json`, `scripts/`, CI config
- "we use X" → `package.json`, the lockfile, and actual imports in source
- entry points and file claims → the file exists *and* something references it
- design values → the token definition and every use site
- structural claims → the markup or config that produces the structure

Record `path:line` for each verdict. A verdict with no evidence is not a verdict.

## 3. Classify every claim

- **ACCURATE** — the code agrees.
- **STALE** — the code disagrees and the code is deliberate. Fix the doc.
- **VIOLATED** — the code disagrees and the doc is a rule the code should obey.
  Fix the code.
- **DECISION** — neither side is clearly right, or the drift exposes a choice
  nobody ever made. Escalate; do not guess.
- **UNVERIFIABLE** — too vague to check. Propose a concrete rewrite, or deletion.

To separate STALE from VIOLATED, ask what the document is *for*. One that says
agents "must follow these rules" is a specification: when it disagrees with the
code, suspect the code. One that describes what exists is a description: suspect
the document.

## 4. Let git arbitrate

When it is unclear which side drifted, history decides:

```bash
git log --oneline -S '<string>' -- <path>   # commits that added or removed it
git log -1 --format='%h %s' -- <path>       # last change to this file
```

A value stable across many commits is intentional. A value that disappeared
inside an unrelated refactor was probably collateral damage — that is a DECISION
to escalate, not a doc edit to make.

## 5. Audit the reverse direction

Stale docs are only half the problem. Also report:

- Rules enforced by tooling but documented nowhere: build scripts, CI checks, hooks
- Files that are the real source of truth that no document points to
- **Custom properties or tokens referenced but never defined.** An undefined
  `var(--x)` does not raise an error; the declaration is dropped silently and the
  property falls back to its initial value.
- Config, entry points or assets referenced by docs that no longer exist
- Dead files and dead rules that nothing references

## 6. Report

Output one markdown table per document: claim | verdict | evidence (`path:line`) |
proposed action.

Put DECISION items in their own section at the end, each stated as a plain
question the user can answer in one line.

Close with the single highest-impact finding and why it matters. Then stop and
wait for approval before changing anything.
