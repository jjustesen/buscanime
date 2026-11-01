# Voice

Text must sound like a person who writes to colleagues or customers. It must
not sound like a manual, a press release, or a chatbot. The voice rules apply
in both registers. The examples are short drafts. Each draft shows one or two
typical faults, and the text after it shows the fix.

These rules are a starting point. Where the owner's own writing differs (their
greeting, their sign-off, how formal they are, the words they like), match the
owner. When you learn one of the owner's habits, add it to "The owner's
habits" at the end of this file. The next agent then knows it too.

## Voice rules

1. **Give the reason first.** Say what problem a person has before you say
   what the change does. The reader then knows why it matters.
2. **Use "so" to join a cause and its result.** "The page is shorter, so
   people finish it." This is the main connector of the voice.
3. **State facts firmly. Mark opinions as opinions.** Do not hedge a fact
   ("this may possibly speed things up"). Do not state an opinion as a fact.
   Write "I think" or "I'm not sure that" before an opinion, and invite a
   reply ("but I can be convinced").
4. **Name the open problem.** If a part of the work is not solved, say so.
   Say who owns it, if someone else owns it.
5. **Put the ask last.** Give what the reader needs to act: the link, the
   decision, the date. Say what blocks you: "I need your OK before I send it."
6. **Give the other case.** If a plan can go two ways, give both. "I will join
   late or miss it. I will be back for the demo."
7. **Credit people.** "As you suggested", "the checkout work that the design
   team did".
8. **Use "we" for the team and "I" for yourself.** Do not hide who did
   something in a passive sentence.
9. **Name concrete things.** Not "some background work", but "the nightly
   reminder email". Not "a limited release", but "a test with 20 customers".

## Doc register

### Context paragraph

Draft:

> To let customers pick up where they left off a resume link has been added to
> the reminder email. The idea is that clicking the link allows the restoration
> of their progress. The app will check the link based on its age, but old
> accounts still need handling.

Fix:

> Some customers start onboarding on their phone and never finish. To bring
> them back, this change adds a resume link to the reminder email. The link
> opens the step where the customer stopped.
>
> The app rejects a link that is older than 7 days. Accounts from before this
> change have no saved step, so they start again at step one.

What changed:

- The passive "has been added" became "this change adds". The reader now
  knows who adds it.
- "The idea is that" and "the restoration of" are gone. The verb "opens"
  carries the point.
- "Based on its age" became an exact condition: older than 7 days.
- "Old accounts still need handling" became the named case and what happens
  to it.
- The future tense "will check" became "rejects", because it is how the app
  behaves.

### Status in a pull request description

Draft:

> Reworked to use the existing email service, new templates were added for the
> reminder, what happens to customers who unsubscribed is still open but that
> will be checked with support.

Fix:

> The change uses the existing email service, with two new templates for the
> reminder. One question is still open: what to do for customers who
> unsubscribed. The support team owns that question, and they will answer it
> this week.

What changed: the comma splices became sentences. The structure is now what
changed, what is open, and who owns it.

## Chat register

Contractions, openers, and everyday "might" and "should" are correct here.
Fix typos and comma splices. Split a sentence at the second "but" or "and".

### An opinion with an invitation to disagree

Draft:

> I dont think we need a seperate agent for the billing page since its the same
> checkout flow and I think the main agent can handle that but happy to be
> convinced

Fix:

> I'm not sure we need a separate agent for the billing page. It uses the same
> checkout flow, and I think the main agent can handle it. Happy to be
> convinced, though.

### An ask with a blocker

Draft:

> hey so I cut the launch plan down to one page so I can share it with the
> investors, that should get more people reading it like you said. before I send
> it I need your sign off so can you take a look [link]

Fix:

> Hey, I cut the launch plan down to one page so I can share it with the
> investors. That should get more people reading it, like you said. I need your
> sign-off before I send it, so can you take a look? [link]

### A plan with the other case

Draft:

> my flight lands at 10 so might miss standup or join late if its on time but
> I'll be on for the demo

Fix:

> My flight lands at 10, so I might miss standup (or join late if it's on
> time). I'll be on for the demo.

## The owner's habits

Add the owner's habits here as you learn them, one line each, for example
"Signs off with first name only" or "Never uses exclamation marks".
