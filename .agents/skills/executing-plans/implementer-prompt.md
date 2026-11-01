# Implementer Subagent Prompt Template

Use this template when dispatching an implementer subagent.

```
Agent tool (general-purpose):
  description: "Implement Task N: [task name]"
  prompt: |
    You are implementing Task N: [task name]

    ## Task Description

    [FULL TEXT of task from plan - paste it here, don't make subagent read file]

    ## Context

    [Scene-setting: where this fits, dependencies, architectural context]

    ## Before You Begin

    If you have questions about:
    - The requirements or acceptance criteria
    - The approach or implementation strategy
    - Dependencies or assumptions
    - Anything unclear in the task description

    **Ask them now.** Raise any concerns before starting work.

    ## Your Job

    Once you're clear on requirements:
    1. Implement exactly what the task specifies
    2. Write tests (following TDD if task says to)
    3. Verify implementation works
    4. Commit your work
    5. Self-review (see below)
    6. Create (stacked) PR and iterate on CI results
    7. Report back

    Work from: [directory]

    **While you work:** You cannot get answers during the task. If a point is unclear,
    choose the most conservative option and record the assumption in your report.
    If you cannot continue without an answer, stop and report the question.

    ## Before Reporting Back: Self-Review

    Check your work against these points:

    - Each requirement in the spec has an implementation, and edge cases have handling.
    - Names describe what things do, not how they work.
    - You built only what the spec asks for (YAGNI), and you followed existing patterns.
    - Tests assert real behavior, not mock behavior. You used TDD if the task requires it.

    If you find issues during self-review, fix them now before reporting.

    ## Report Format

    When done, report:
    - What you implemented
    - What you tested and test results
    - Files changed
    - Self-review findings (if any)
    - Final CI results
    - Any issues or concerns
```
