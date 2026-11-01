---
name: writing
description: >-
  Write, edit, or review any prose for the owner or in the owner's name: commit
  messages, pull request titles and descriptions, READMEs and other docs,
  status reports to the owner, emails, Slack messages, and posts. Use this
  skill before you draft any of that, including every commit message and pull
  request description. Also use it when the owner asks to make text plainer,
  clearer, shorter, more human, or less AI-sounding.
---

# Writing

Everything an agent writes for the owner, or sends in the owner's name, must be
plain and must sound like a person wrote it. This skill has three parts: the
voice, the registers, and a pass that removes the habits that make text read as
AI-written.

## 1. Read the voice guide first

**Read `references/voice.md` before you draft anything, every time, in both
registers.** The plain-language rules below make text clear. Only the voice
makes it sound like a person, and it is the part that agents skip most often.
Writing plainly from memory is not enough. A commit message or a two-line
message needs the voice as much as a long doc does.

A draft that is plain but does not follow the voice rules is not done. Before
you hand it over, check it against each voice rule:

- The reason comes before the proposal.
- "So" joins a cause and its result.
- Facts are firm, and opinions are marked as opinions.
- The open problem has a name.
- The ask comes last.

If you learn how the owner writes (their greeting, their sign-off, how formal
they are), match it, and add it to the end of `references/voice.md`.

## 2. Pick the register

| | Doc register | Chat register |
|---|---|---|
| Use for | Commit messages, pull request descriptions, READMEs, docs | Status updates to the owner, review replies, emails, Slack, posts |
| Contractions | No | Yes |
| Openers ("So", "Hey", "But") | No | Yes |
| "might", "should" | No. Use "can" or "must" | Yes, in their everyday sense |
| Sentence limit | 25 words | No fixed limit. Split at the second "but" or "and" |

Both registers fix typos and comma splices, and both use the same voice.

## 3. Plain-language rules

- Use the active voice, and name who does the action.
- Use the simple present for how a system behaves: "The app sends a reminder",
  not "The app will send a reminder".
- Give exact conditions: "older than 7 days", not "old".
- One idea per sentence. A paragraph has one topic, and its first sentence
  states that topic.
- No semicolons and no em dashes. Use a period, a comma, a colon, or
  parentheses.
- Use everyday words: "use", not "leverage". "Need", "help", and "set up" are
  fine.
- Delete empty frames ("The idea is that", "The goal is to") and state the
  point.
- Use a verb, not a noun stack: "can send money", not "the facilitation of
  money transfers".
- Replace a vague claim with its fact: not "robust", but the failures that the
  system survives.
- Keep a technical term when it names one thing, and explain it in a few words
  the first time the owner sees it.

## 4. Sound like a person

For anything sent in the owner's name (emails, posts, Slack, and longer
pieces), read `references/human-tells.md` and apply it to the draft. It lists
the habits that make text read as AI-written. Examples are a closing sentence
that restates importance, "not X, but Y", triads, filler, and the wrong
register for the medium. In the doc register, use it to cut those habits,
and keep the doc register's rules. Where the two files differ, the voice guide wins.

## 5. What not to rewrite

- Code, commands, file paths, and names of settings. Quote them exactly.
- Text that an app shows on screen, even if the text is not plain.
- Product names and people's names.

## Judgment calls

Never give up accuracy for a rule. After accuracy, follow the voice, then the
plain-language rules, then make the text short.
