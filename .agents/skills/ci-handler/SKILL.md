---
name: ci-handler
description: After completing implementation, and pushing the branch to remote, verify and iterate with CI to make sure the change builds correctly.
---

# CI Handler

Work with the continuous integration pipeline to make sure the change builds correctly. Important -- when working with PR stacks, you MUST make sure that each PR in the stack builds. So if the stack is PR1, PR2, and PR3, PR1 must build before PR2, and PR2 must build before PR3.

## The workflow

### Setup (once)
Use the `pull-request-manager` skill to make sure the change is pushed to remote and has a matching pull request.

### In a loop (until success)
Prefer launching a subagent to run this loop (`ci-watcher`) rather than doing this yourself.

1. Check the CI status with `gh pr checks <pr> --watch --fail-fast`. If the checks are not complete yet, wait in increments of 5 minutes to check again.
2. If the build is successful, you are done!
3. If no checks appear after a reasonable wait (5 minutes), run `gh run list --branch <branch>`. If the repository has no CI workflow, tell the user and stop.
4. If the build fails, then:
    - Launch a subagent that:
      * Fetches the failed logs with `gh run view <run-id> --log-failed`.
      * Carefully analyzes the root cause of the failure and comes up with a plan to fix it.
      * Verifies that that plan makes sense with the broader intent of the changes (beware of e.g. main breakages that could nudge towards unrelated changes)
      * Implements the fix.
      * Commits and pushes the fix to remote, also uses `gh` to update the pull request description as needed.
    - Then, start the loop again at (1).

### Handling build failures

* Keep in mind that `main` might sometimes have flaky/failing tests unrelated to our change. If you are very certain that the failure is unrelated to the goal of the current change (verifiable via the plan and/or the PR description), then it's safe to ignore that failure and consider CI as passing. Report this scenario back to the user.
* Be careful that the build failures don't "balloon" the PR or make the rest of the PR stack unsensible. E.g. if you are fixing something in PR3 that PR5 already fixes, maybe there's a broader scope/ordering problem to consider.

### After success

Once something successfully built, look out for feedback from review bots on the PR. If there is feedback, consider fixing it. Not all feedback is always actionable/correct, but you should consider it. Make sure that the feedback is not outdated.
