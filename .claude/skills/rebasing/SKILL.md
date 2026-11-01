---
name: rebasing
description: A skill that should be used when asked to rebase a branch
---

- Always sync main first using `git fetch origin main`.
- If on a stacked branch, rebase the top branch with `git rebase --update-refs origin/main`, so the branches below it move too. Otherwise use `git rebase origin/main`. Then fix conflicts. Never leave in a partial rebased state.
- Sometimes it can be helpful to squash the commits in the current branch into one before doing a rebase; especially when there are many commits. Consider this.
- After the rebase, push each moved branch with `git push --force-with-lease`. On your own feature branch you can do this without asking. Ask first for `main` or any branch that someone else pushes to.
- Do not spawn review agents/steps unless you've made notable code changes.
