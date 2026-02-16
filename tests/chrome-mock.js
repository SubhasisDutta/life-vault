// Mock chrome.storage.local API for testing
// This must be loaded BEFORE any app scripts

(function () {
  "use strict";

  const store = {};

  window.chrome = {
    storage: {
      local: {
        get: function (keys, callback) {
          const result = {};
          if (Array.isArray(keys)) {
            keys.forEach(function (k) {
              if (store[k] !== undefined) result[k] = JSON.parse(JSON.stringify(store[k]));
            });
          } else if (typeof keys === "string") {
            if (store[keys] !== undefined) result[keys] = JSON.parse(JSON.stringify(store[keys]));
          }
          if (callback) callback(result);
        },
        set: function (obj, callback) {
          Object.keys(obj).forEach(function (k) {
            store[k] = JSON.parse(JSON.stringify(obj[k]));
          });
          if (callback) callback();
        },
        remove: function (keys, callback) {
          if (Array.isArray(keys)) {
            keys.forEach(function (k) { delete store[k]; });
          } else {
            delete store[keys];
          }
          if (callback) callback();
        },
        clear: function (callback) {
          Object.keys(store).forEach(function (k) { delete store[k]; });
          if (callback) callback();
        }
      }
    },
    runtime: {
      getURL: function (path) { return path; }
    },
    action: {
      onClicked: {
        addListener: function () {}
      }
    }
  };

  // Expose store for test inspection
  window.__chromeStoreMock = store;

  // Helper to reset the store between tests
  window.__resetChromeStore = function () {
    Object.keys(store).forEach(function (k) { delete store[k]; });
  };
})();
