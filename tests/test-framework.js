// Minimal test framework — no dependencies required
// Provides describe/it/assert pattern with colored console + HTML output

(function () {
  "use strict";

  const results = {
    suites: [],
    total: 0,
    passed: 0,
    failed: 0,
    errors: []
  };

  let currentSuite = null;

  function describe(name, fn) {
    const suite = { name, tests: [], passed: 0, failed: 0 };
    results.suites.push(suite);
    currentSuite = suite;
    try {
      fn();
    } catch (e) {
      suite.tests.push({ name: "Suite setup error", passed: false, error: e.message });
      suite.failed++;
      results.failed++;
      results.total++;
    }
    currentSuite = null;
  }

  function it(name, fn) {
    results.total++;
    const test = { name, passed: false, error: null };
    try {
      fn();
      test.passed = true;
      results.passed++;
      if (currentSuite) currentSuite.passed++;
    } catch (e) {
      test.error = e.message || String(e);
      results.failed++;
      results.errors.push({ suite: currentSuite ? currentSuite.name : "unknown", test: name, error: test.error });
      if (currentSuite) currentSuite.failed++;
    }
    if (currentSuite) currentSuite.tests.push(test);
  }

  const assert = {
    equal: function (actual, expected, msg) {
      if (actual !== expected) {
        throw new Error((msg || "Assertion failed") + `: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
      }
    },
    deepEqual: function (actual, expected, msg) {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error((msg || "Deep equal failed") + `: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
      }
    },
    ok: function (val, msg) {
      if (!val) {
        throw new Error(msg || "Expected truthy value, got: " + JSON.stringify(val));
      }
    },
    notOk: function (val, msg) {
      if (val) {
        throw new Error(msg || "Expected falsy value, got: " + JSON.stringify(val));
      }
    },
    includes: function (str, substr, msg) {
      if (typeof str !== "string" || !str.includes(substr)) {
        throw new Error((msg || "Includes failed") + `: "${substr}" not found in "${String(str).substring(0, 100)}"`);
      }
    },
    notIncludes: function (str, substr, msg) {
      if (typeof str === "string" && str.includes(substr)) {
        throw new Error((msg || "Not includes failed") + `: "${substr}" was found`);
      }
    },
    greaterThan: function (actual, expected, msg) {
      if (!(actual > expected)) {
        throw new Error((msg || "Greater than failed") + `: ${actual} is not > ${expected}`);
      }
    },
    isArray: function (val, msg) {
      if (!Array.isArray(val)) {
        throw new Error(msg || "Expected array, got: " + typeof val);
      }
    },
    isObject: function (val, msg) {
      if (typeof val !== "object" || val === null || Array.isArray(val)) {
        throw new Error(msg || "Expected object, got: " + typeof val);
      }
    },
    throws: function (fn, msg) {
      let threw = false;
      try { fn(); } catch (e) { threw = true; }
      if (!threw) throw new Error(msg || "Expected function to throw");
    },
    typeof: function (val, type, msg) {
      if (typeof val !== type) {
        throw new Error((msg || "Type check failed") + `: expected ${type}, got ${typeof val}`);
      }
    }
  };

  function renderResults() {
    // Console output
    console.log("\n====================================");
    console.log("  Life Vault Test Results");
    console.log("====================================\n");

    results.suites.forEach(suite => {
      const icon = suite.failed === 0 ? "\u2705" : "\u274C";
      console.log(`${icon} ${suite.name} (${suite.passed}/${suite.tests.length})`);
      suite.tests.forEach(test => {
        if (test.passed) {
          console.log(`   \u2714 ${test.name}`);
        } else {
          console.log(`   \u2718 ${test.name}`);
          console.log(`     Error: ${test.error}`);
        }
      });
      console.log("");
    });

    console.log("------------------------------------");
    console.log(`Total: ${results.total} | Passed: ${results.passed} | Failed: ${results.failed}`);
    console.log("====================================\n");

    // HTML output
    const container = document.getElementById("test-results");
    if (!container) return;

    let html = `<div class="test-summary ${results.failed === 0 ? 'all-pass' : 'has-failures'}">
      <h2>${results.failed === 0 ? 'All Tests Passed!' : 'Some Tests Failed'}</h2>
      <div class="test-counts">
        <span class="count total">${results.total} total</span>
        <span class="count passed">${results.passed} passed</span>
        ${results.failed > 0 ? `<span class="count failed">${results.failed} failed</span>` : ''}
      </div>
    </div>`;

    results.suites.forEach(suite => {
      const suiteClass = suite.failed === 0 ? "suite-pass" : "suite-fail";
      html += `<div class="test-suite ${suiteClass}">
        <div class="suite-header" onclick="this.parentElement.classList.toggle('collapsed')">
          <span class="suite-icon">${suite.failed === 0 ? '\u2705' : '\u274C'}</span>
          <span class="suite-name">${suite.name}</span>
          <span class="suite-count">${suite.passed}/${suite.tests.length}</span>
        </div>
        <div class="suite-tests">`;

      suite.tests.forEach(test => {
        html += `<div class="test-case ${test.passed ? 'pass' : 'fail'}">
          <span class="test-icon">${test.passed ? '\u2714' : '\u2718'}</span>
          <span class="test-name">${test.name}</span>
          ${test.error ? `<div class="test-error">${test.error}</div>` : ''}
        </div>`;
      });

      html += `</div></div>`;
    });

    container.innerHTML = html;
  }

  // Expose globally
  window.describe = describe;
  window.it = it;
  window.assert = assert;
  window.renderTestResults = renderResults;
  window.testResults = results;
})();
