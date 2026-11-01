---
name: agents-md
description: >-
  Create, rightsize, or audit a repository's agent instruction file — AGENTS.md
  or CLAUDE.md. Use this skill when a repo needs its first instruction file,
  when an existing one has grown into a rulebook nobody reads, when the user
  asks to set up AGENTS.md or CLAUDE.md, and when instructions in a repo
  contradict each other or restate what the code already shows. Also use it to
  make one file serve both Claude Code and Codex.
---

# Repo instruction files

The file is a briefing, not a rulebook. A capable model reads the code; what it
cannot read is the history, the constraint, and the trap.

## What earns a place

- **Gotchas.** The thing that looks wrong but is deliberate. "All types live in
  one 4000-line file because the codegen step requires it."
- **Non-obvious architecture.** Boundaries and data flow that the directory tree
  does not reveal.
- **Commands that are not discoverable.** A test suite that needs a running
  container, an env var without which everything silently no-ops.
- **Conventions that differ from the ecosystem default.** Only where this repo
  departs from what the tooling already implies.
- **Scars.** Anything that has burned someone before.

## What does not

- Anything readable from the filesystem — the stack, the directory layout, which
  test runner is installed.
- Generic best practice. "Write clear code", "handle errors", "add tests."
- Style the formatter already enforces. If `prettier` and `eslint` run in CI,
  the file does not need an opinion on quotes or line length.
- Restated framework documentation.
- Two rules that disagree. Pick one and delete the other.

## Shape

Keep it short — a page, not a manual. Every added line dilutes the ones that
matter.

Use progressive disclosure: point to a skill or a reference file instead of
inlining a long procedure. `See the verify skill before reporting done` beats
forty lines of test instructions.

Nested `AGENTS.md` files scope to their own subtree, and the deeper file wins on
conflict. Put subsystem-specific guidance next to the subsystem.

Codex truncates the file at `project_doc_max_bytes` (32 KiB default). A file
near that ceiling is already too long for a different reason.

## One file, both tools

Claude Code reads `CLAUDE.md`; Codex reads `AGENTS.md`. To serve both from one
source, make `AGENTS.md` the real file and link the other name to it:

```
ln -s AGENTS.md CLAUDE.md
```

Codex can also pick up a repo that ships only a `CLAUDE.md`, if
`~/.codex/config.toml` sets `project_doc_fallback_filenames = ["CLAUDE.md"]`. The symlink is the better choice for a repo you control, because it
is visible to everyone who clones it.

## Rightsizing an existing file

1. Read the file and the repo together.
2. Delete every line that fails the tests above. Deletion is the main activity.
3. Resolve contradictions rather than adding a rule about which one wins.
4. Move long procedures into skills and leave a pointer.
5. Tell the user what you cut and why, so they can veto a specific line.

Write the file in plain language: short sentences and everyday words.
