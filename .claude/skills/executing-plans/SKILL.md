---
name: executing-plans
description: Use when executing implementation plans
---

# Executing Plans: Subagent-Driven Development

Execute the plan by dispatching a fresh subagent per task, with two stages of review after each: spec compliance first, then code quality. See `requesting-code-review` for how to dispatch a review (including reasoning effort).

`writing-plans` owns the `docs/plans/current.txt` and plan-file bookkeeping. Keep the plan file up to date as you go, marking tasks complete after each.

**Core principle:** Fresh subagent per task plus two-stage review (spec then quality) gives high quality and fast iteration.

**Incremental progress:** When working on a stacked PR, push each branch once its work is done and iterate on CI results (`pull-request-manager` and `ci-handler` skills).

## The Process

Track all tasks with TaskCreate/TaskUpdate. For each task:

1. Read the plan once, extract every task with its full text and context, and create the tasks.
2. Dispatch the implementer subagent (`./implementer-prompt.md`) with the full task text and scene-setting context. Answer any questions before it proceeds.
3. The implementer implements, tests, commits, and self-reviews.
4. Dispatch the spec reviewer (`./spec-reviewer-prompt.md`). If it finds gaps, the same implementer fixes them and the spec reviewer re-reviews. Repeat until it passes.
5. Only after spec compliance passes, dispatch the code quality reviewer (`./code-quality-reviewer-prompt.md`). Same fix-and-re-review loop until approved.
6. Mark the task complete and move to the next.

After all tasks, dispatch a final code review over the whole implementation, run the project's full lint and test suite, then use `pull-request-manager` and `ci-handler` to finish.

## Prompt Templates

- `./implementer-prompt.md` - implementer subagent
- `./spec-reviewer-prompt.md` - spec compliance reviewer subagent
- `./code-quality-reviewer-prompt.md` - code quality reviewer subagent

## Red Flags

- **Never dispatch multiple implementer subagents in parallel** (they conflict). One implementer plus one reviewer or planner in parallel is fine.
- **Never start code quality review before spec compliance passes.** Wrong order wastes a review pass.
- If a subagent fails a task, dispatch a fix subagent with specific instructions rather than fixing it yourself (avoids context pollution).

## Integration

- **writing-plans** creates the plan this skill executes.
- **requesting-code-review** covers how reviewer subagents are dispatched.
- Subagents follow **test-driven-development** for tasks where tests earn their place.
