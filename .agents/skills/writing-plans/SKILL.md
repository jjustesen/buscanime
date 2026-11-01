---
name: writing-plans
description: Use when you have a spec or requirements for a multi-step task, before touching code
---

# Writing Plans

## Overview

Write comprehensive implementation plans assuming the engineer has zero context for our codebase and questionable taste. Document everything they need to know: which files to touch for each task, code, testing, docs they might need to check, how to test it. Give them the whole plan as bite-sized tasks. DRY. YAGNI. TDD. Frequent commits.

Assume they are a skilled developer, but know almost nothing about our toolset or problem domain. Assume they don't know good test design very well and they are maybe not as smart as you to come up with good algorithms or the right data structures.

Split the tasks into stacked branches/PRs that are (1) self contained, (2) build & compile, (3) pass tests and (4) are easy to review. Small PRs get better reviews and are safe to ship one at a time. Usually there are multiple ways to split things, e.g. if there are multiple API methods, each one can be a separate PR. If there's a domain, an API and a persistence layer change, each could be its own PR.

Each PR must also be safe when deployed alone. A green CI run is not sufficient. A parent PR must not accept a state that only a child PR can process. If the parent widens a type, it must handle the new state on each live path. If it cannot, it must refuse to store the new state until the child ships.

**Announce at start:** "I'm using the writing-plans skill to create the implementation plan."

**Save plans to:** `docs/plans/YYYY-MM-DD-<feature-name>.md`
- Update `docs/plans/current.txt` to contain which `<feature-name>.md` you are currently working on.

## Project defaults

Before you write tasks, find how the project builds, tests, lints, and formats (README, Makefile, `package.json`, CI config). Use those exact commands in the plan, and end the plan with a task that runs the full lint and test suite. Tests use Arrange/Act/Assert. Avoid mocks/stubs unless explicitly approved or required due to external effects (e.g. external API calls).

## Bite-Sized Task Granularity

Each step is one action that builds independently (5-15 minutes): follow the `test-driven-development` skill for the test-then-implement cycle, then commit, then create the (stacked) PR and iterate on CI results.

## PR Slicing

Large PRs are hard to review. If you think something will result in a large PR (e.g. more then 500-1k lines of code), and it is avoidable, split into smaller PRs. Remember that each PR needs to individually build and pass tests. If it is unavoidable, make sure to explain why (e.g. a broad refactor to a core interface that touches many files).

## Plan Document Header

**Every plan MUST start with this header:**

<plan_header>
# [Feature Name] Implementation Plan

> REQUIRED SUB-SKILL: Use `executing-plans` to implement this plan task-by-task.

## Useful context 
[Explain the context the implementing engineer needs to understand the change.
Cover the background and the why: what problem this solves, how it fits the
surrounding system, and any prior decisions or constraints that shaped the
approach. Do not assume they already know why the change is needed.]

## Goal
[One sentence describing what this builds]

## Architecture
[2-3 sentences about approach]

## Domain model
[A good domain model sketch focuses strictly on the real-world concepts of a business problem rather than the technical details of a database or software implementation. It uses the "ubiquitous language" of the business so that both developers and domain experts can easily understand it. Model core entities, meaningful attributes and relationships.]
```
Interval: week | month | year (new)
UsageLimit (new): currency, maximum amount, interval
PaymentProfile: optional default limit, a limit for each provider (new)
```

## Pull request layout
[note that not all PRs need to be stacked, but the section should explain the exact layout]

### PR1 <branch-name-1> main: <description-1>
Motivation: <motivation-1>

### PR2 <branch-name-2> <branch-name-1>: <description-2>
Motivation: <motivation-2>

### ...

### PRN <branch-name-N> <branch-name-N-1>: <description-N>
Motivation: <motivation-N>

[add a note here if the PR requires rebasing/restacking (mostly relevant for incremental changes). if so, don't incldue this as a task in the plan.]

## Backwards compatibility
[fill out this section if applicable -- mostly relevant for changes to database schemas, stored data formats, background jobs, or public APIs]
</plan_header>

## Task Structure

The examples are for Ruby, but generalize to any language. Each task in the plan _must_ follow this structure. One (and only) exception: for user-facing copy changes (e.g. updating an error message, a dashboard button label, etc.), you can skip the tests asserting that the message was updated.

<task>
### Task N: [Component Name]
Status: [TODO, IN_PROGRESS, COMPLETED]

#### Files
- Create: `exact/path/to/file.rb`
- Modify: `exact/path/to/existing.rb:123-145`
- Delete: `exact/path/to/file.rb`
- Test: `exact/path/to/file.test.rb`

#### Pseudocode
```
// key interfaces
interface MyInterface {
  void doSomething(String input);
}

// key data structures
struct MyDataStructure {
  String field1;
  int field2;
}

// key algorithms
void myAlgorithm(MyDataStructure data) {
  // implementation
}
```

#### Step 1: Test-driven implementation
Follow the `test-driven-development` skill for the failing-test-then-minimal-implementation cycle. Add a test where it earns its place: bug fixes, tricky logic, and real edge cases. Match the test and implementation style of a neighboring file. Run the tests with the project's test command (e.g. `bundle exec ruby -Itest path/to/file.test.rb`), then run the project's linter.

#### Step 2: Simplify the code
Use the simplify-code skill to simplify the code. Rerun the tests to verify everything still passes.

#### Step 3: Self-review the code
Launch a sub-agent and use the requesting-code-review skill to request a code review from it. If there's feedback, fix it and re-run the sub-agent. Use a sub-agent, not your own context: a fresh context does not share the assumptions you made while writing the code.

FEEDBACK:
```
<fill in after subagent review>
```

#### Step 4: Commit
```bash
git add path/to/file.rb path/to/file.test.rb
git commit
```
Write the message to the commit rules in AGENTS.md.

#### Step 5: Create (stacked) PR and iterate on CI results
Use the pull-request-manager and the ci-handler skills to create a PR and iterate on CI results.
</task>

## Remember
- Exact file paths always
- Complete code in plan (not "add validation")
- Exact commands with expected output
- DRY, YAGNI, TDD, frequent commits

## Self-Review

After writing the complete plan, look at the spec with fresh eyes and check the plan against it. This is a checklist you run yourself, not a subagent dispatch.

**1. Spec coverage:** Skim each section/requirement in the spec. Can you point to a task that implements it? List any gaps.

**2. Placeholder scan:** Search your plan for vague filler ("add validation", "handle errors", "etc.", "TODO", "...") standing in for real content. Replace each with the concrete file paths, code, and commands the task needs.

**3. Type consistency:** Do the types, method signatures, and property names you used in later tasks match what you defined in earlier tasks? A function called `clearLayers()` in Task 3 but `clearFullLayers()` in Task 7 is a bug.

**4. New states:** When a type gets a new state, list each writer, reader, converter, comparison, and lifecycle path that touches it. Point to the task that handles each one. A path you do not name is a path that raises in production.

If you find issues, fix them inline. No need to re-review, just fix and move on. If you find a spec requirement with no task, add the task.

## Execution Handoff

After saving the plan, offer execution choice:

**"Plan complete and saved to `docs/plans/<filename>.md`. If you are good to go we can run via executing-plans!"**
