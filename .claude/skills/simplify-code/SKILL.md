---
name: simplify-code
description: Use after finishing writing any code
---

# Simplify

Often code is written that is more complex than necessary, is duplicative of existing code, or not even needed.

A few specific expectations:

* Prefer clarity over cleverness.
* Inline or remove abstractions that don’t buy us much.
* Eliminate unnecessary conditionals, nesting, and indirection.
* Use clearer names for variables and functions so the code explains itself.
* If logic is repeated, extract it once; if it’s only used once, don’t over-abstract it.
* Keep the happy path easy to follow.
* Remove dead code, outdated comments, and one-off complexity that no longer matters.
* Avoid redundant test setup code -- extract test helpers.