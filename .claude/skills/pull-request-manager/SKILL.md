---
name: pull-request-manager
description: A skill that must always be used for git operations and managing github pull requests.
---

Make sure the current changes are correctly tracked via git commits, that each branch is pushed, and that there's a matching and accurate pull request for every branch of the current stack. Double check that you don't have any empty branches/PRs in the stack (e.g. commonly happens by mistake at the bottom of a stack).

Do not switch the checkout only to open or update a PR, because `gh` and `git diff` work without it. Creating a branch for new work is fine. Use `gh` to make the PR, and `git diff <base>...<branch>` to get the contents of the exact PR. Never make assumptions from descriptions/titles of commits. Use the repository's PR template for descriptions: `.github/PULL_REQUEST_TEMPLATE.md`, a file under `.github/PULL_REQUEST_TEMPLATE/`, or an area-specific template. Also check existing PRs using `gh` to see if they are relevant and provide context for your change. When you look for your own open PRs with `gh pr list`, add `--author "@me"`.

If PRs already exist, then fetch their description using `gh` and make sure they are fully up to date.

# Stacking PRs/branches
Stacking is encouraged when a change is too large for one reviewable PR. Branch each PR from the one below it, and open it with `gh pr create --base <parent-branch>`. Push with `git push -u origin <branch>`, or `git push --force-with-lease` after a rebase. Use the `rebasing` skill to move a stack.

# Title
Write a short title in the imperative. Use `gh pr list --state merged --limit 10` to match the style of recent titles in the repository.

# PR Description
- Write the PR title, the PR description, and each commit message with the
  `writing` skill, to the rules in AGENTS.md.
- The PR description MUST reflect the _intent_ of the change clearly. Why are we doing this in the first place? If it's part of a sequence of PRs, clarify how subsequent PRs rely on it. Also, what's the broader theme?
- The PR description MUST cover the whole PR, not only the latest commit. Cover means the intent and the scope, not a list of each change.
  - If you are making incremental changes to an existing PR, rewrite the description for the whole PR.
- Use H3 headings for each section.
- Add an ASCII or mermaid diagram only when a data flow or model relation is hard to follow in prose.
- In the testing section, don't be overly verbose about all the tests you ran. Just reference 1-3 key test files + what gives you confidence that the change is correct.
- If you are implementing a plan from `docs/plans/`, link the plan file in the PR description.

# Base branch
The base branch is not always `main`. Inspect the stack and use the branch directly below this one.

# Self-Review
Before creating a PR, review the full base-to-head diff for unrelated or accidental changes; prefer dispatching the `requesting-code-review` skill (to a sub-agent) rather than reviewing it yourself. Watch for changes that don't belong: for example, a PR rarely touches test infrastructure, and a change to an unrelated module is clearly wrong. If there's feedback, fix it and re-review.

PR creation, updates, and merges follow the sign-off rules in the user's AGENTS.md.
