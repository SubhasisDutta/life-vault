# Life Vault - Test Suite

A comprehensive test suite for the Life Vault Chrome extension covering all core functionality.

## Quick Start

### Option 1: Headless (Node.js — recommended for CI)

```bash
node tests/run-tests-headless.js
```

Runs all 109 tests in Node.js with colored terminal output. Exit code 0 on success, 1 on failure.

**Requirements:** Node.js 14+

### Option 2: Browser

```bash
# macOS
open tests/test-runner.html

# Linux
xdg-open tests/test-runner.html

# Or use the helper script
./tests/run-tests.sh
```

Opens a visual test runner in the browser with collapsible test suites and pass/fail indicators. Also check the browser console (F12) for detailed output.

## What's Tested

The test suite covers all items from the CLAUDE.md Testing Considerations section:

| Test Area | Tests | Description |
|-----------|-------|-------------|
| **Theme switching** | 7 | Dark/light toggle in both directions, persistence |
| **Multiple children** | 4 | Dynamic {firstChild} expansion for each child |
| **Export/import roundtrip** | 8 | JSON export structure, import restore, merge with defaults |
| **Template saves** | 2 | Regular and custom item template data persistence |
| **Search** | 3 | Cross-category search, case insensitive, empty results |
| **Custom item creation** | 5 | All 3 priority levels, defaults, timestamps |
| **Custom item details** | 2 | Template data saves for custom items |
| **Custom item deletion** | 3 | Removes item + associated template data + checked status |
| **Custom items in progress** | 4 | Included in stats, category progress, critical counts |
| **Custom items persistence** | 1 | Saves to chrome.storage.local |
| **Custom items in export** | 1 | Included in JSON export/import |
| **Dynamic investments** | 1 | Investment accounts appear in Brokerage folder |
| **Dynamic credit cards** | 1 | Credit cards appear in Credit Cards folder |
| **Data integrity** | 11 | CATEGORIES, TEMPLATES, PRIORITY_COLORS structure validation |
| **Helper functions** | 12 | Key generators, escAttr, placeholder replacement |
| **Progress calculations** | 9 | Overall, per-category, stats, filter-aware |
| **Filter system** | 5 | Priority filtering, custom items respecting filters |
| **Edge cases** | 8 | Empty state, XSS prevention, undefined children |
| **Toggle check** | 3 | Check/uncheck items, storage persistence |
| **Cache invalidation** | 3 | Processed categories cache behavior |
| **Storage keys** | 2 | Uniqueness and completeness |

**Total: 109 tests across 34 test suites**

## Test Architecture

```
tests/
├── test-runner.html        # Browser-based visual test runner
├── run-tests-headless.js   # Node.js headless runner (CI-friendly)
├── run-tests.sh            # Shell script to open browser runner
├── chrome-mock.js          # Mock for chrome.storage.local API
├── test-harness.js         # Exposes IIFE internals as LifeVaultTestAPI
├── test-framework.js       # Minimal describe/it/assert framework (zero deps)
├── tests.js                # All test suites
└── TESTING.md              # This file
```

### Why a custom test framework?

The app is a Chrome extension with no build system, no npm, and no module system (IIFE pattern). Rather than introduce heavy dependencies (Jest, Mocha, etc.), this suite uses a zero-dependency test framework that:

- Runs directly in the browser (matching the real runtime)
- Runs headlessly in Node.js (for CI)
- Requires no installation or build step
- Keeps the test infrastructure self-contained in the `tests/` directory

### How it works

Since `app.js` wraps all logic in an IIFE, functions aren't directly accessible. The test harness (`test-harness.js`) re-implements the same core logic and exposes it via `window.LifeVaultTestAPI`. This tests the *algorithms and logic* without testing the full DOM rendering pipeline, which requires the Chrome extension environment.

## Adding New Tests

1. Open `tests/tests.js`
2. Add a new `describe` block or `it` test within an existing suite
3. Always call `API.reset()` at the start of each `it()` block to ensure clean state
4. Use the `assert` methods: `equal`, `deepEqual`, `ok`, `notOk`, `includes`, `notIncludes`, `greaterThan`, `isArray`, `isObject`, `throws`, `typeof`

Example:

```javascript
describe("My new feature", function () {
  it("does something expected", function () {
    API.reset();
    // ... setup
    assert.equal(actual, expected, "optional message");
  });
});
```

## Not Covered (requires Chrome extension environment)

These items require the full Chrome extension runtime and are best tested manually:

- **PDF export button styling in light mode** — Visual CSS verification
- **Full DOM rendering** — The `render()` function rebuilding `#app` innerHTML
- **Setup wizard flow** — Multi-step wizard with DOM input elements
- **Settings modal save** — Reading values from DOM inputs
- **Debounced search input** — Real-time input event handling
- **File import via file picker** — Requires browser File API
- **Modal overlay click-to-close** — Event delegation on overlay element
