#!/usr/bin/env node

// Headless test runner using Node.js
// Runs all unit/logic tests without a browser
// For full UI tests, use the browser-based test-runner.html

const path = require("path");
const fs = require("fs");
const vm = require("vm");

// === Setup fake DOM environment ===
const fakeDocument = {
  documentElement: {
    setAttribute: function () {},
    getAttribute: function () { return "dark"; }
  },
  getElementById: function () {
    return {
      innerHTML: "",
      addEventListener: function () {},
      style: {},
      focus: function () {},
      setSelectionRange: function () {}
    };
  },
  querySelector: function () { return null; },
  querySelectorAll: function () { return []; },
  createElement: function () {
    return { href: "", download: "", click: function () {}, style: {} };
  },
  body: {
    appendChild: function () {},
    removeChild: function () {}
  }
};

const fakeWindow = {
  document: fakeDocument,
  open: function () { return null; },
  __chromeStoreMock: {},
  __resetChromeStore: null,
  URL: {
    createObjectURL: function () { return "blob:test"; },
    revokeObjectURL: function () {}
  },
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  alert: function () {},
  confirm: function () { return true; }
};

// Create context
const context = vm.createContext({
  ...fakeWindow,
  window: fakeWindow,
  document: fakeDocument,
  console: console,
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  JSON: JSON,
  Date: Date,
  Math: Math,
  Array: Array,
  Object: Object,
  Set: Set,
  String: String,
  Error: Error,
  parseInt: parseInt,
  parseFloat: parseFloat,
  Blob: function (content, opts) { this.content = content; this.type = opts?.type; },
  FileReader: function () {
    this.onload = null;
    this.readAsText = function (file) {
      if (this.onload) this.onload({ target: { result: file } });
    };
  }
});

// === Load scripts in order ===
const scriptsDir = __dirname;
const rootDir = path.dirname(scriptsDir);

function loadScript(filePath) {
  const code = fs.readFileSync(filePath, "utf8");
  try {
    vm.runInContext(code, context, { filename: path.basename(filePath) });
  } catch (e) {
    console.error(`Error loading ${filePath}: ${e.message}`);
    process.exit(1);
  }
}

console.log("======================================");
console.log("  Life Vault Headless Test Runner");
console.log("======================================\n");

// 1. Chrome mock
loadScript(path.join(scriptsDir, "chrome-mock.js"));
// Point fakeWindow to the mock
context.chrome = context.window.chrome;
context.__chromeStoreMock = context.window.__chromeStoreMock;
context.__resetChromeStore = context.window.__resetChromeStore;

// 2. App data
loadScript(path.join(rootDir, "data.js"));
loadScript(path.join(rootDir, "templates.js"));

// 3. Test harness
loadScript(path.join(scriptsDir, "test-harness.js"));
// Bridge the API
context.LifeVaultTestAPI = context.window.LifeVaultTestAPI;

// 4. Test framework
loadScript(path.join(scriptsDir, "test-framework.js"));
// Bridge test functions
context.describe = context.window.describe;
context.it = context.window.it;
context.assert = context.window.assert;
context.renderTestResults = function () {}; // No HTML rendering in headless
context.testResults = context.window.testResults;

// 5. Run tests
loadScript(path.join(scriptsDir, "tests.js"));

// === Output results ===
setTimeout(() => {
  const results = context.window.testResults;

  results.suites.forEach(suite => {
    const icon = suite.failed === 0 ? "\x1b[32m\u2713\x1b[0m" : "\x1b[31m\u2717\x1b[0m";
    console.log(`${icon} ${suite.name} (${suite.passed}/${suite.tests.length})`);
    suite.tests.forEach(test => {
      if (test.passed) {
        console.log(`  \x1b[32m\u2714\x1b[0m ${test.name}`);
      } else {
        console.log(`  \x1b[31m\u2718 ${test.name}\x1b[0m`);
        console.log(`    \x1b[31m${test.error}\x1b[0m`);
      }
    });
    console.log("");
  });

  console.log("--------------------------------------");
  const statusColor = results.failed === 0 ? "\x1b[32m" : "\x1b[31m";
  console.log(`${statusColor}Total: ${results.total} | Passed: ${results.passed} | Failed: ${results.failed}\x1b[0m`);
  console.log("======================================\n");

  process.exit(results.failed > 0 ? 1 : 0);
}, 100);
