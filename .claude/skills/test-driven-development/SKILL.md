---
name: test-driven-development
description: Use when you fix a bug, or implement tricky logic or behavior with real edge cases, before writing implementation code
---

# Test-Driven Development (TDD)

Write the test first and watch it fail before writing implementation.

## Core principle

A test you never saw fail has not proven it tests anything. Tests written after
the code pass immediately, which tells you nothing: they may test the wrong
thing, test the implementation instead of the behavior, or miss the edge cases
you forgot. Seeing the test fail first is what proves it works.

If you wrote the implementation first, it is usually cleaner to re-derive it from
the test than to retrofit a test around it. Reusing the existing code tends to
bias the test toward what you built rather than what the behavior requires.

## When to use

Use TDD where tests earn their place: bug fixes, tricky logic, and behavior with
real edge cases.

Reasonable exceptions, worth a quick check with your human partner: throwaway
prototypes, generated code, and configuration files. Exploration is fine too:
throw the exploration away, then start fresh with TDD.

For a bug fix, write a failing test that reproduces the bug first. The test
proves the fix and guards against regression.

## Good tests

- **Minimal:** one behavior per test. If the name needs "and", split it.
- **Clearly named:** the name describes the scenario and expected outcome, so it
  reads as documentation.
- **Real:** exercise real code. Reach for mocks only when a dependency is slow,
  external, or otherwise unavoidable.

## When stuck

- **Don't know how to test it?** Write the API you wish existed, then the
  assertion. Still stuck, ask your human partner.
- **Test is complicated?** The design is probably complicated. Simplify the
  interface.
- **Must mock everything?** The code is too coupled. Use dependency injection.
- **Setup is huge?** Extract helpers. If it stays complex, simplify the design.

Hard to test usually means hard to use. Listen to the test.

## Testing anti-patterns

When adding mocks or test utilities, read @testing-anti-patterns.md for the
common pitfalls (testing mock behavior, test-only methods in production classes,
mocking without understanding dependencies, incomplete mocks).
