---
name: verify
description: >-
  Run a project's real verification loop — lint, typecheck, tests, build — and
  report the actual output before calling work done. Use this skill before
  reporting that a change is complete, before opening a pull request, and
  whenever the user asks whether something works, asks you to run the tests, or
  asks you to check your work. It discovers the project's own commands instead
  of assuming npm test or pytest.
---

# Verify before you claim it works

"Should work" is not a result. Run the thing.

## 1. Find the real commands

Do not assume. Read, in this order of trust:

1. **CI config** — `.github/workflows/*.yml`, `.gitlab-ci.yml`, `.circleci/`.
   This is the gate that actually blocks a merge, so it is the truth.
2. **Task runner** — `Makefile`, `justfile`, `Taskfile.yml`.
3. **Package manifest** — `scripts` in `package.json`; `[tool.poetry.scripts]`,
   `[tool.pytest.ini_options]`, or a `[tool.uv]` block in `pyproject.toml`;
   `tox.ini`, `noxfile.py`, `Cargo.toml`, `composer.json`.
4. **Contributor docs** — a `Testing` or `Development` section in `README.md`
   or `CONTRIBUTING.md`.

Note the runtime the project expects: `uv run`, `npm` vs `pnpm` vs `yarn`,
`docker compose exec`, a required env var, a database that must be up. A test
command that needs a service will fail confusingly without it.

## 2. Run it

Narrow first — the tests covering what you changed. Then the full suite if it
finishes in reasonable time. Then lint and typecheck.

If the suite is slow, say so and ask whether to run it, rather than skipping it
silently.

## 3. Report honestly

- Quote real output. Paste the failing assertion, not a summary of it.
- Failures get reported as failures, in the same message as the work.
- Say which commands you ran and which you did not.
- If nothing runnable exists, state that plainly: "This repo has no test suite;
  I verified by <what you actually did>." Never let silence imply a green run.

## 4. Failures you did not cause

Check the baseline before you own a failure:

```
git stash && <test command>; git stash pop
```

If it failed before your change, report it and leave it alone unless the user
asks. Do not expand scope into unrelated repairs.
