# Testing Anti-Patterns

Load this when writing or changing tests, adding mocks, or tempted to add
test-only methods to production code.

Tests must verify real behavior, not mock behavior. Mocks isolate; they are not
the thing under test. Strict TDD prevents most of the patterns below: writing the
test first against real code shows you what the test actually needs before you
reach for a mock.

## Anti-Pattern 1: Testing mock behavior

Asserting that a mock rendered proves the mock exists, not that the code works.
Test the real component, or if it must be mocked for isolation, assert on the
behavior of the code under test rather than on the mock.

```typescript
// Bad: verifies the mock, not the component
test('renders sidebar', () => {
  render(<Page />);
  expect(screen.getByTestId('sidebar-mock')).toBeInTheDocument();
});

// Good: test the real component
test('renders sidebar', () => {
  render(<Page />);
  expect(screen.getByRole('navigation')).toBeInTheDocument();
});
```

## Anti-Pattern 2: Test-only methods in production

A method used only by tests pollutes the production class, risks being called for
real, and often confuses object lifecycle with entity lifecycle. Put it in test
utilities instead.

```typescript
// Bad: destroy() exists only for test cleanup
class Session {
  async destroy() {
    await this._workspaceManager?.destroyWorkspace(this.id);
  }
}
afterEach(() => session.destroy());

// Good: cleanup lives in test utilities
export async function cleanupSession(session: Session) {
  const workspace = session.getWorkspaceInfo();
  if (workspace) {
    await workspaceManager.destroyWorkspace(workspace.id);
  }
}
afterEach(() => cleanupSession(session));
```

## Anti-Pattern 3: Mocking without understanding

Mocking a method that has a side effect the test depends on makes the test pass
for the wrong reason or fail mysteriously. Mock at the lowest level (the actual
slow or external operation), and preserve the behavior the test needs. If you are
unsure what the test depends on, run it against the real implementation first,
then add minimal mocking.

```typescript
// Bad: mocking the config write the test depends on
test('detects duplicate server', () => {
  vi.mock('ToolCatalog', () => ({
    discoverAndCacheTools: vi.fn().mockResolvedValue(undefined)
  }));
  await addServer(config);
  await addServer(config);  // should throw, but won't
});

// Good: mock only the slow server startup
test('detects duplicate server', () => {
  vi.mock('MCPServerManager');
  await addServer(config);  // config written
  await addServer(config);  // duplicate detected
});
```

## Anti-Pattern 4: Incomplete mocks

A mock with only the fields you think you need hides structural assumptions. It
passes while real integration fails, because downstream code reads a field you
omitted. Mirror the complete data structure as it exists in reality. When
uncertain, include all documented fields.

```typescript
// Bad: missing metadata that downstream code reads
const mockResponse = {
  status: 'success',
  data: { userId: '123', name: 'Alice' }
};

// Good: mirror the real response
const mockResponse = {
  status: 'success',
  data: { userId: '123', name: 'Alice' },
  metadata: { requestId: 'req-789', timestamp: 1234567890 }
};
```

## Anti-Pattern 5: Tests as an afterthought

"Implementation complete, ready for testing" is not complete. Testing is part of
implementation. TDD would have produced the test first.

## When mocks get too complex

If the mock setup dwarfs the test logic, mocks lack methods the real components
have, or the test breaks whenever a mock changes, ask whether you need the mock
at all. Integration tests with real components are often simpler than elaborate
mocks.

## Summary

- Do not assert on `*-mock` elements. Test the real component or unmock it.
- Move test-only methods out of production classes into test utilities.
- Understand a dependency before mocking it; mock at the lowest level and only
  what is slow or external.
- Mirror real data structures completely; partial mocks fail silently.
- Write tests as part of implementation, not after.
- Mocking "just to be safe" is a red flag. Mocks isolate, they are not what you
  test.
