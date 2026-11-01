# Sounding human

Most "AI detectors" fail, but human readers don't. They catch AI prose through a small set of structural habits, not a vocabulary list. This file targets the habits.

## Core principle

**AI writing is risk-averse.** It hedges, balances every claim, and closes with vague uplift because those are the safest next tokens. Human writing takes a position and stops. If a rewrite feels slightly under-padded and slightly opinionated, you're probably close.

Before applying any rule below, ask: *what is this paragraph trying to do?* (Provoke, decide, instruct, describe a specific fact.) If the paragraph has no function, cutting it beats rewriting it.

## The habits to kill

Apply in order. Each pass is cheap.

**No single marker is proof.** Readers and detectors both work on clusters. One triad is nothing; a triad plus uniform sentence length plus three hedges is a giveaway. Weigh the density, not the presence.

### 1. Delete the closing significance sentence

The strongest AI tell is a final sentence that restates importance, legacy, or broader relevance. It almost always begins with a participle or vague nominal: *"highlighting...", "underscoring...", "reflecting...", "a testament to...", "marking a pivotal..."*.

Rule: **Delete the last sentence of every paragraph if it generalizes rather than adds a specific fact.** If the paragraph collapses without it, the paragraph was filler.

### 2. Kill the "not X, but Y" reflex

Symmetrical negation is the most recognizable AI cadence:
- "It's not just a car, it's a statement."
- "This isn't about sourcing — it's about framing."
- "Not a career, not a body of work — just a moment."

Rule: **At most one negation-parallelism per 1,000 words.** Usually zero. Write the positive claim directly.

### 3. Break the rule of three

AI defaults to triads: "bold, elegant, and refined" / "keynote sessions, panel discussions, and networking opportunities." Triads feel rhythmic, which is why the model reaches for them.

Rule: **Use pairs, singles, or fours.** If a triad appears, test whether one of the three items is filler. It usually is.

### 4. Restore "is" and "are"

AI avoids simple copulas in favor of *serves as, stands as, represents, marks, embodies, constitutes*. It also prefers *features/offers/boasts/maintains* over *has*.

Rule: **Rewrite every *serves as / stands as / represents* to *is*.** Rewrite *features/boasts/offers* to *has*. Keep the substitution only if the verb carries real meaning (e.g., *represents* in a legal sense).

### 5. Strip the "-ing" analysis tail

AI attaches free-floating participial phrases that editorialize: *"...expanding rapidly, reflecting growing demand."* / *"...a new policy, highlighting the shift toward..."*.

Rule: **End sentences on the fact, not the interpretation.** If the interpretation matters, promote it to its own sentence with a subject and verb. If it doesn't, cut it.

### 6. Cut hedges and transitions

Delete on sight (unless the specific logical work is real):
- Sentence-initial *Moreover, Furthermore, Additionally, Notably, Importantly, Consequently*
- *It's worth noting that / It's important to note that / It should be remembered that*
- *In conclusion, In summary, Overall*
- *While [positive], [subject] faces challenges...* (the "Despite" pivot)

Rule: **If the sentence works without the transition, drop it.** Most do.

### 7. Starve the vocabulary

Strong signals when clustered (one is fine, five is a giveaway): *delve, tapestry, testament, pivotal, underscore, crucial, vibrant, intricate, landscape (abstract), showcase, foster, enhance, bolster, meticulous, align with, garner, boast, nestled, rich, profound, emphasize, highlight (verb), interplay, enduring, valuable insights*.

Also: *in the heart of, a testament to, plays a pivotal role, stands as, serves as a reminder, reflects the broader, deeply rooted, indelible mark*.

Rule: **Replace with the plainest synonym or delete.** *Pivotal* → *important* or cut. *Showcase* → *show*. *Underscore* → *show* or cut. *Delve into* → *look at*.

**Target the reflex, not the list.** Word lists age fast — "delve" dropped sharply in academic prose within months of being named, because writers edited it out while everything else stayed the same. The durable habit underneath is a reach for the Latinate, polysyllabic word where a short Anglo-Saxon one would do: *utilize/use, facilitate/help, commence/start, subsequent/next, demonstrate/show, individuals/people, obtain/get, sufficient/enough*. The Economist's 2026 comparison found more Latinate suffixes in every model's prose than in human text. When a word feels like it's wearing a suit, swap it.

### 8. Put the punctuation back

The strongest current marker, and the one most guides get backwards. LLMs *under*-punctuate: fewer commas and semicolons than human writers, and hardly any parentheses. They join clauses with "and" instead, which produces long, flat sentences that never pause. ("and" is the single most overused word in machine prose.)

Rule: **Where a sentence runs long on "and", cut it or repunctuate it.** Where two clauses lean on each other, make them two sentences, or join them with a comma and "so" or "but". Use parentheses for the aside you would actually say out loud. Do not use semicolons, because plain mode bans them. Under-punctuation reads as machine, and varied punctuation reads as a person thinking in real time.

### 9. Stop announcing the payoff

Setup phrases that promise an insight and then fail to deliver one: *"Here's the kicker", "But here's the thing", "Here's what most people miss", "Let me be clear", "Honestly?"*. The drumroll is doing work the claim cannot.

Rule: **Delete the announcement, keep the claim.** If the claim collapses without its introduction, it was not an insight.

### 10. Cut the true-but-empty sentence

Statements that are accurate, unobjectionable, and teach nothing: *"Consistency is important." "Every team is different." "Good communication matters."* They survive because nothing in the model penalises a safe truth.

Rule: **Every sentence should be falsifiable or cuttable.** If nobody could disagree with it, it is filler wearing the costume of a point.

### 11. Weigh the trade-off instead of naming it

AI acknowledges both sides and then declines to choose. It reads balanced. It is actually evasive, and a reader who needs to act on the text gets nothing.

Rule: **After naming a trade-off, say which way you would go and what it costs.** A recommendation with a stated downside is human. A both-sides paragraph with no verdict is not.

### 12. Show the connective step

AI arguments teleport. Sentence A is true and sentence C is true, and the reasoning between them is missing. Each sentence passes inspection alone; the paragraph does not hold.

Rule: **Read consecutive sentences and ask whether B follows from A.** Where a step is missing, write it. Where it cannot be written, the claim was wrong.

### 13. Leave the loose ends in

Machine output is suspiciously tidy: every reference closes, every section balances, nothing dangles, no detail is surplus. Human writing carries an aside that goes nowhere and a specific that only mattered to the writer.

Rule: **Keep one concrete detail that is not strictly necessary.** Also cut over-tidy self-reference (*"as mentioned above", "as noted earlier"*) — people either repeat themselves or trust the reader. And quote someone: machine prose almost never carries a real quotation.

## Format tells (edit even if prose is fine)

- **Em dashes:** never use them. Replace each one with a comma, a colon, parentheses, or a new sentence. Do not swap an em dash for another "and", because that brings back the under-punctuation of habit 8.
- **Curly quotes** (" " ' '): If the user's native environment produces straight quotes, convert. Mixed quote styles within one document is a strong tell.
- **Bold spam:** Don't bold key terms throughout paragraphs. Bold is for the rare case where a reader skimming must not miss a word.
- **Title Case Headings:** Prefer sentence case unless the house style is otherwise.
- **Inline-header vertical lists** (bullet + bold term + colon + explanation): Only use when the structure is genuinely parallel and discrete. For three or fewer items, use prose.
- **Emoji in headings or bullets:** Delete.
- **Triple-dash thematic breaks before headings:** Delete.

## Structural moves

- **Vary sentence length.** AI clusters at 18–28 words. Drop a 5-word sentence in. In the chat register, a 40-word one is fine too. In the doc register, stay under the 25-word limit and vary below it. Rhythm breaks pattern recognition faster than vocabulary changes.
- **Start paragraphs with a claim, not a setup.** AI prefers "Founded in 1987, the company has since become..."; humans often lead with the point.
- **Let things be uneven.** If one example is stronger than the others, don't manufacture parallel examples. Say one.
- **Name specifics.** "Revenue grew" → "Revenue grew from $4M to $11M in 18 months." The AI instinct is to generalize because specifics are statistically rare — which is exactly why they feel human.
- **Leave things unresolved when they are.** Not every piece needs a conclusion. Stopping is allowed.

## Workflow

When asked to humanize text:

1. **Read it once** and identify its actual function. If it has none, tell the user before editing.
2. **Pass 1 — delete:** Kill closing significance sentences (habit 1), hedges and transitions (habit 6), and any triads with a weak third (habit 3). Often cuts 20–30% of length.
3. **Pass 2 — de-symmetrize:** Break "not X but Y" patterns (habit 2). Break participial analysis tails (habit 5).
4. **Pass 3 — de-pad:** Restore copulas (habit 4). Swap vocabulary (habit 7).
5. **Pass 4 — format:** Em dashes, quotes, bold, headings, lists (see Format tells).
6. **Pass 5 — read aloud.** If any sentence sounds like a LinkedIn post or a press release, rewrite.

## Short-form: emails, Slack, texts

Short-form has its own tells. The long-form rules above still apply (especially triads, em dashes, closing significance), but the dominant problem shifts to **register mismatch** and **structural overkill**.

### Match the medium's register

Before editing, identify the medium's baseline:
- **Text / DM:** lowercase-ok, no greeting, no signoff, contractions, fragments.
- **Slack:** casual-professional. Greeting optional. Usually no signoff. One idea per message; break threads.
- **Internal email:** greeting + first name, minimal signoff, direct.
- **External / cold email:** greeting, one-sentence purpose, one-sentence ask, brief signoff.

AI defaults to *external email* register for everything. That's the root problem.

### Email/message tells to kill

- **"I hope this email finds you well" / "I hope you're doing well" / "I hope this message finds you well."** Delete. Always.
- **"I wanted to reach out to..." / "I'm writing to..."** Delete — just say the thing.
- **"Just wanted to check in on..."** Usually fine; watch for when AI uses it as padding before a real request.
- **"Please don't hesitate to reach out" / "Looking forward to hearing from you" / "Thank you for your time and consideration."** Pick at most one closing line, or none for internal messages.
- **Subject-line-in-the-body:** AI sometimes prepends "Subject: [whatever]" at the top of a message body. Always delete.
- **Mirror-restating the sender's message** before responding ("Thanks for your email regarding the Q3 planning meeting. As you mentioned..."). Cut the mirror. Start from your reply.
- **Structured response to an unstructured question.** If someone Slacks "wdyt about the new pricing?", don't reply with a bulleted list and bolded headers. Reply in one paragraph, or three short lines.
- **Over-apologizing for brevity or timing:** "Apologies for the delay in responding" for a 1-day reply, "Sorry for the short message" on a message that's already too long.
- **Excessive gratitude:** "Thank you so much for...", "I really appreciate...", "That's incredibly helpful." One "thanks" is plenty; zero is often right.
- **Formal sign-offs in casual channels:** "Best regards," on Slack. Usually wrong. "Best," or nothing is fine internally; no signoff at all on Slack/DM.

### Text/Slack-specific tells

- **Capitalized "Hi [Name]," opening on a DM.** AI does this. Humans usually don't on Slack/text — they just start.
- **Complete sentences where fragments would do.** "Yes, that works for me." → "yep works" or "works."
- **Ending every message with a question to prompt response** ("Does that make sense?", "Let me know your thoughts!"). Sometimes appropriate; AI does it reflexively.
- **Emoji as punctuation.** An emoji at the end of every message is a tell. Use them the way the user naturally does — or not at all.
- **Bullet points in a 40-word message.** Almost always wrong. Use prose.

### Short-form workflow

1. **Identify register.** Text < Slack < internal email < external email. Write at the correct level, not one above.
2. **Cut the opening pleasantry.** If the first sentence isn't load-bearing, delete it.
3. **Cut the closing pleasantry.** Same test.
4. **Collapse structure.** If the message is under ~75 words, no headers, no bullets, no bold. Just sentences.
5. **Shrink.** A good rule: halve the length, then see if anything important died. Usually nothing did.
6. **Contractions on.** *I would* → *I'd*. *Do not* → *don't*. Unless the register is formally external.

### Templates

**Internal Slack (replacing AI's version):**

> ~~Hi Sarah, I hope you're doing well! I wanted to circle back on the pricing deck we discussed last week. Do you think you'd be able to share the latest version when you have a chance? Thanks so much in advance!~~
>
> can you send the latest pricing deck when you get a sec?

**Internal email:**

> ~~Hi Tom, I hope this email finds you well. I wanted to reach out regarding the onboarding process for new hires. I've noticed several areas where we could potentially streamline the workflow, and I thought it might be valuable to discuss these with you at your earliest convenience. Please let me know if you'd be open to a brief meeting. Looking forward to hearing from you. Best regards, Sam~~
>
> Tom, a few parts of new-hire onboarding are dragging. Got 20 min this week to talk through fixes?
>
> Sam

**External cold email:** keep greeting + signoff, but one-sentence purpose, one-sentence ask. No "I hope this finds you well."

## When NOT to apply these rules

- **Legal, regulatory, or safety-critical text** — hedging is load-bearing.
- **Academic abstracts in fields with rigid conventions** — the conventions predate LLMs.
- **The user's own distinctive voice is already non-AI** — don't flatten a real writer into your house style. Match their register; only strip the AI habits.

## Quick diagnostic

Paste a suspect paragraph and check:
- Does it end with a participle phrase that generalizes? (→ cut)
- Any "not just... but..." / "not X, it's Y"? (→ rewrite)
- Three parallel adjectives or noun phrases? (→ drop one)
- More than one *pivotal / underscore / tapestry / testament / vibrant / showcase / foster*? (→ replace)
- A "Despite [challenges], [subject] continues to..." pivot? (→ delete whole sentence)
- Long sentences joined by "and", with no semicolons and no parentheses anywhere? (→ repunctuate)
- Every sentence roughly the same length? (→ break the rhythm)
- A sentence nobody could disagree with? (→ cut it)
- A trade-off named with no verdict attached? (→ choose)
- Nothing surplus, nothing unresolved, every thread tied? (→ leave one loose)

Five or more yes answers: the paragraph is AI-shaped regardless of origin. Rewrite from the claim, not the prose.
