# Rules for AI agents

These rules apply to every AI agent that works on my projects: Claude Code, Codex, and any
other tool that reads this file. I am not a developer. The rules keep the work safe, keep
agents out of each other's way, and keep me informed.

## One agent per task

- Give each task to one agent. Two agents never edit the same files or the same branch at
  the same time.
- Each agent works on its own branch, named `feature/<short-desc>`. It can commit to that
  branch and push it without asking.
- Run agents in parallel only on tasks that touch different files. If you are not sure, run
  them one after another.
- Hand work to another tool or agent (for example Codex or a Grok bot) only when I ask for
  it by name. Each tool uses its own quota.
- For a change with more than a few steps, write a plan first with the `writing-plans`
  skill. Then carry it out one task at a time with the `executing-plans` skill.

## Sign-off

- Ask me before anything goes into `main` (or the default branch): a merge, a push, or a
  commit made on it.
- Open a pull request for each change. The pull request is where I review the work.
- Never post, edit, or delete a comment, reply, or review on GitHub until I approve the
  exact text.
- Never run a destructive command without asking first: deleting files or folders,
  `git push --force`, rewriting history, or dropping a database. On your own feature
  branch, a rebase and `git push --force-with-lease` are fine.
- When you run without me (in the background or in CI), stop at the pull request.

## How to work

- Make the smallest change that does the job. Do not add features or settings that nobody
  asked for.
- Before you say a task is done, run the project's checks and tests, and show me the result
  (the `verify` skill). "It should work" is not a result.
- Write tests where they earn their place: bug fixes, tricky logic, and real edge cases.
- If a request is not clear, ask one short question instead of guessing.
- Finish the whole task. If part of it is blocked, do the rest and tell me what is left and
  why.

## How to talk to me

- Use the `writing` skill for everything you write for me or send in my name, and read
  its voice guide (`references/voice.md`) before every draft.
- Write in plain language: short sentences, everyday words, no jargon. If you need a
  technical term, explain it in a few words.
- Start with the result. Then say what changed, what it costs or risks, and what you need
  from me.
- Say plainly when something failed or when you are not sure.

## Commits and pull requests

- A commit message has a short subject in the imperative ("Add a login page"), then a few
  sentences on what changed and why.
- A pull request description says what the change does and why, in one or two short
  paragraphs. If the repository has a pull request template, follow it.
- Describe the result, not the story of how you got there.

## This project: Winnin frontend challenge

The brief is in `FRONTEND.md`. Read it before you plan. Stack: React (Next.js optional) and
TypeScript, data from the AniList GraphQL API, layout from the Figma link in the brief.

- Before you write code, read `docs/CONVENTIONS.md` (structure, types, tests, Storybook,
  language) and the current plan named in `docs/plans/current.txt`.
- Figma values (colors, fonts, sizes) are in `docs/figma/spec.md`. Read it instead of
  calling the Figma MCP again.

- Follow the Figma exactly. If something is missing or unclear, ask me.
- Required: filter by format, search by text, and `averageScore` color on each card
  (below 50 red, 50 to 80 yellow, above 80 green).
- Deliverables: `README.md` (run and test steps), `DECISIONS.md` (trade-offs, what was
  added, what was left out), and `AI_LOG.md` (tools used, how the work was checked,
  what was corrected or rejected). Keep `AI_LOG.md` up to date as you work.
- Keep real, readable commits on the feature branch. Do not squash or hide iterations.
- I must be able to explain every line. Prefer simple code over clever code, and explain
  each non-obvious choice when you make it.
- Cover loading, empty, and error states, and keyboard and screen reader use.
- Run the tests, type check, and lint before you say a task is done.
