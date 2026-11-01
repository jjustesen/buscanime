---
name: receiving-code-review
description: Use when receiving code review feedback, before implementing suggestions, especially if feedback seems unclear or technically questionable - requires technical rigor and verification, not blind implementation
---

# Code Review Reception

Evaluate feedback technically before implementing. Verify against the codebase. Ask when something is unclear rather than guessing, and clarify related items together so partial understanding does not produce a wrong implementation.

## Trust by source

**From your human partner:** trusted. Implement after you understand it. Still ask if scope is unclear.

**From external reviewers:** suggestions to evaluate, not orders to follow. Before implementing, check whether the suggestion is correct for this codebase, whether it breaks existing behavior, whether there is a reason for the current implementation, and whether the reviewer has full context. If you cannot verify a claim, say so and ask how to proceed. If a suggestion conflicts with your partner's earlier decisions, stop and discuss with them first.

## YAGNI check

When a reviewer asks you to "implement properly" or build out a feature, grep for actual usage first. If nothing calls it, propose removing it instead: "Nothing calls this endpoint. Remove it (YAGNI)?" If it is used, implement properly.

Rationale: you and the reviewer both report to the same person. If we do not need the feature, do not add it.

## Pushing back

Push back when a suggestion breaks existing behavior, is wrong for this stack, ignores a legacy or compatibility reason, violates YAGNI, or conflicts with an architectural decision the reviewer lacks context on. Use technical reasoning: reference the tests or code that show the problem, ask specific questions, and involve your partner if the disagreement is architectural.

If you pushed back and turn out to be wrong, state the correction and move on: "Checked X, it does Y. Fixing now." No long apology, no defending why you pushed back.

Example of good pushback:
> Reviewer: "Remove legacy code."
> You: "Build target is 10.15+, this API needs 13+. We need the legacy path for backward compat. The current impl has the wrong bundle ID though: fix that, or drop pre-13 support?"

## GitHub thread replies

Draft each reply and show it to your partner. Post a reply only after your partner approves its exact text. Approval for the code changes does not cover the replies.

When you post an approved reply to an inline review comment, reply in the comment thread (`gh api repos/{owner}/{repo}/pulls/{pr}/comments/{id}/replies`), not as a top-level PR comment.
