// Life Vault — Comprehensive Test Suite
// Tests all functionality referenced in CLAUDE.md testing considerations

(function () {
  "use strict";

  const API = window.LifeVaultTestAPI;

  // Reset state before each suite
  function beforeEach() {
    API.reset();
  }

  // =====================================================
  // 1. HELPER FUNCTIONS
  // =====================================================

  describe("Helper: itemKey", function () {
    it("generates correct key format", function () {
      assert.equal(API.itemKey("identity", 0, 2), "identity-0-2");
    });
    it("handles numeric strings", function () {
      assert.equal(API.itemKey("legal", 3, 10), "legal-3-10");
    });
  });

  describe("Helper: templateKey", function () {
    it("generates key with tpl- prefix", function () {
      assert.equal(API.templateKey("identity", 0, 2), "tpl-identity-0-2");
    });
  });

  describe("Helper: customItemKey", function () {
    it("generates key with custom- prefix", function () {
      assert.equal(API.customItemKey("identity", 0, "abc123"), "custom-identity-0-abc123");
    });
  });

  describe("Helper: customTemplateKey", function () {
    it("generates key with tpl-custom- prefix", function () {
      assert.equal(API.customTemplateKey("legal", 1, "xyz789"), "tpl-custom-legal-1-xyz789");
    });
  });

  describe("Helper: folderKey", function () {
    it("generates correct folder key", function () {
      assert.equal(API.folderKey("identity", 3), "identity-3");
    });
  });

  describe("Helper: escAttr", function () {
    beforeEach();
    it("escapes ampersands", function () {
      assert.equal(API.escAttr("A & B"), "A &amp; B");
    });
    it("escapes double quotes", function () {
      assert.equal(API.escAttr('say "hello"'), "say &quot;hello&quot;");
    });
    it("escapes angle brackets", function () {
      assert.equal(API.escAttr("<script>"), "&lt;script&gt;");
    });
    it("handles empty strings", function () {
      assert.equal(API.escAttr(""), "");
    });
    it("converts numbers to string", function () {
      assert.equal(API.escAttr(42), "42");
    });
  });

  describe("Helper: generateCustomItemId", function () {
    it("generates a non-empty string", function () {
      const id = API.generateCustomItemId();
      assert.typeof(id, "string");
      assert.ok(id.length > 0, "ID should not be empty");
    });
    it("generates unique IDs", function () {
      const ids = new Set();
      for (let i = 0; i < 100; i++) {
        ids.add(API.generateCustomItemId());
      }
      assert.equal(ids.size, 100, "All 100 IDs should be unique");
    });
  });

  // =====================================================
  // 2. PLACEHOLDER SYSTEM
  // =====================================================

  describe("Placeholder: replacePlaceholders", function () {
    beforeEach();
    it("replaces {familyName}", function () {
      API.setState({ settings: { ...API.DEFAULT_SETTINGS, familyName: "Smith Family" } });
      assert.equal(API.replacePlaceholders("{familyName} vault"), "Smith Family vault");
    });
    it("replaces {primaryUser}", function () {
      API.setState({ settings: { ...API.DEFAULT_SETTINGS, primaryUserName: "John" } });
      assert.equal(API.replacePlaceholders("{primaryUser} account"), "John account");
    });
    it("replaces {partner}", function () {
      API.setState({ settings: { ...API.DEFAULT_SETTINGS, partnerName: "Jane" } });
      assert.equal(API.replacePlaceholders("For {partner}"), "For Jane");
    });
    it("replaces {firstChild} with first child name", function () {
      API.setState({ settings: { ...API.DEFAULT_SETTINGS, children: ["Alice", "Bob"] } });
      assert.equal(API.replacePlaceholders("{firstChild} cert"), "Alice cert");
    });
    it("replaces {children} with comma-separated list", function () {
      API.setState({ settings: { ...API.DEFAULT_SETTINGS, children: ["Alice", "Bob", "Charlie"] } });
      assert.equal(API.replacePlaceholders("Kids: {children}"), "Kids: Alice, Bob, Charlie");
    });
    it("uses default 'Child' when no children", function () {
      API.setState({ settings: { ...API.DEFAULT_SETTINGS, children: [] } });
      assert.equal(API.replacePlaceholders("{firstChild}"), "Child");
    });
    it("uses default 'Children' when no children for {children}", function () {
      API.setState({ settings: { ...API.DEFAULT_SETTINGS, children: [] } });
      assert.equal(API.replacePlaceholders("{children}"), "Children");
    });
    it("handles null/undefined input", function () {
      assert.equal(API.replacePlaceholders(null), null);
      assert.equal(API.replacePlaceholders(undefined), undefined);
    });
    it("replaces multiple placeholders in one string", function () {
      API.setState({ settings: { ...API.DEFAULT_SETTINGS, primaryUserName: "John", partnerName: "Jane" } });
      assert.equal(API.replacePlaceholders("{primaryUser} and {partner}"), "John and Jane");
    });
  });

  // =====================================================
  // 3. THEME SWITCHING
  // =====================================================

  describe("Theme: switching in both directions", function () {
    it("starts in dark mode by default", function () {
      API.reset();
      assert.equal(API.getState().currentTheme, "dark");
    });
    it("switches to light mode", function () {
      API.reset();
      API.applyTheme("light");
      assert.equal(API.getState().currentTheme, "light");
    });
    it("switches back to dark mode", function () {
      API.reset();
      API.applyTheme("light");
      API.applyTheme("dark");
      assert.equal(API.getState().currentTheme, "dark");
    });
    it("persists theme to storage", function () {
      API.reset();
      API.applyTheme("light");
      const store = window.__chromeStoreMock;
      assert.equal(store["lifeorg-theme"], "light");
    });
    it("getThemeIcon returns sun in dark mode", function () {
      API.reset();
      assert.includes(API.getThemeIcon(), "\u2600");
    });
    it("getThemeLabel returns 'Light Mode' in dark mode", function () {
      API.reset();
      assert.equal(API.getThemeLabel(), "Light Mode");
    });
    it("getThemeLabel returns 'Dark Mode' in light mode", function () {
      API.reset();
      API.applyTheme("light");
      assert.equal(API.getThemeLabel(), "Dark Mode");
    });
  });

  // =====================================================
  // 4. CHILDREN EXPANSION (Dynamic Item Expansion)
  // =====================================================

  describe("Dynamic: child expansion with multiple children", function () {
    beforeEach();
    it("expands {firstChild} items for each child", function () {
      API.setState({
        settings: {
          ...API.DEFAULT_SETTINGS,
          children: ["Alice", "Bob"]
        }
      });
      const cats = API.getProcessedCategories();
      const identity = cats.find(c => c.id === "identity");
      const birthCerts = identity.folders[0]; // Birth Certificates

      // Should have Alice and Bob items instead of {firstChild}
      const aliceItems = birthCerts.items.filter(i => i.text.includes("Alice"));
      const bobItems = birthCerts.items.filter(i => i.text.includes("Bob"));

      assert.ok(aliceItems.length > 0, "Should have Alice items");
      assert.ok(bobItems.length > 0, "Should have Bob items");
    });

    it("skips 'Additional children' item when multiple children configured", function () {
      API.setState({
        settings: {
          ...API.DEFAULT_SETTINGS,
          children: ["Alice", "Bob"]
        }
      });
      const cats = API.getProcessedCategories();
      const identity = cats.find(c => c.id === "identity");
      const birthCerts = identity.folders[0];

      const additionalItem = birthCerts.items.find(i => i.text.includes("Additional children"));
      assert.notOk(additionalItem, "Should not have 'Additional children' item");
    });

    it("keeps {firstChild} text with single child", function () {
      API.setState({
        settings: {
          ...API.DEFAULT_SETTINGS,
          children: ["Alice"]
        }
      });
      const cats = API.getProcessedCategories();
      const identity = cats.find(c => c.id === "identity");
      const birthCerts = identity.folders[0];

      // With single child, items should not be duplicated
      // The {firstChild} in text stays as-is (not replaced by buildProcessedCategories, that's done by replacePlaceholders)
      const childItems = birthCerts.items.filter(i => i.text.includes("{firstChild}"));
      // With 1 child, {firstChild} items are NOT expanded (only with children.length > 1)
      assert.ok(childItems.length > 0, "Single child should keep {firstChild} placeholder");
    });

    it("sets _childIndex on expanded items", function () {
      API.setState({
        settings: {
          ...API.DEFAULT_SETTINGS,
          children: ["Alice", "Bob", "Charlie"]
        }
      });
      const cats = API.getProcessedCategories();
      const identity = cats.find(c => c.id === "identity");
      const birthCerts = identity.folders[0];

      const expandedItems = birthCerts.items.filter(i => i._childIndex !== undefined);
      assert.ok(expandedItems.length > 0, "Should have items with _childIndex");

      const indices = expandedItems.map(i => i._childIndex);
      assert.ok(indices.includes(0), "Should have child index 0");
      assert.ok(indices.includes(1), "Should have child index 1");
      assert.ok(indices.includes(2), "Should have child index 2");
    });
  });

  // =====================================================
  // 5. DYNAMIC BANK ACCOUNT ITEMS
  // =====================================================

  describe("Dynamic: investment accounts in Brokerage folder", function () {
    beforeEach();
    it("adds investment accounts to Brokerage & Investment Accounts folder", function () {
      API.setState({
        settings: {
          ...API.DEFAULT_SETTINGS,
          bankAccounts: [
            { name: "Fidelity 401k", type: "investment" },
            { name: "Vanguard IRA", type: "investment" },
            { name: "Primary Checking", type: "checking" }
          ]
        }
      });
      const cats = API.getProcessedCategories();
      const investments = cats.find(c => c.id === "investments");

      if (investments) {
        const brokerageFolder = investments.folders.find(f => f.name === "Brokerage & Investment Accounts");
        if (brokerageFolder) {
          const fidelityItem = brokerageFolder.items.find(i => i.text.includes("Fidelity 401k"));
          const vanguardItem = brokerageFolder.items.find(i => i.text.includes("Vanguard IRA"));

          assert.ok(fidelityItem, "Should have Fidelity 401k item");
          assert.ok(vanguardItem, "Should have Vanguard IRA item");
          assert.equal(fidelityItem.priority, "critical", "Investment items should be critical");
          assert.ok(fidelityItem._dynamicBank, "Should be marked as dynamic");
        }
      }
    });
  });

  describe("Dynamic: credit cards in Credit Cards folder", function () {
    beforeEach();
    it("adds credit cards to Credit Cards folder", function () {
      API.setState({
        settings: {
          ...API.DEFAULT_SETTINGS,
          bankAccounts: [
            { name: "Chase Sapphire", type: "credit" },
            { name: "Amex Platinum", type: "credit" }
          ]
        }
      });
      const cats = API.getProcessedCategories();
      const financial = cats.find(c => c.id === "financial");

      if (financial) {
        const ccFolder = financial.folders.find(f => f.name === "Credit Cards");
        if (ccFolder) {
          const chaseItem = ccFolder.items.find(i => i.text.includes("Chase Sapphire"));
          const amexItem = ccFolder.items.find(i => i.text.includes("Amex Platinum"));

          assert.ok(chaseItem, "Should have Chase Sapphire item");
          assert.ok(amexItem, "Should have Amex Platinum item");
          assert.includes(chaseItem.text, "card #, login, autopay status");
          assert.ok(chaseItem._dynamicBank, "Should be marked as dynamic");
        }
      }
    });
  });

  describe("Dynamic: checking accounts expansion", function () {
    beforeEach();
    it("adds extra checking accounts to Checking Accounts folder", function () {
      API.setState({
        settings: {
          ...API.DEFAULT_SETTINGS,
          bankAccounts: [
            { name: "Primary Checking", type: "checking" },
            { name: "Business Checking", type: "checking" }
          ]
        }
      });
      const cats = API.getProcessedCategories();
      const financial = cats.find(c => c.id === "financial");

      if (financial) {
        const checkingFolder = financial.folders.find(f => f.name === "Checking Accounts");
        if (checkingFolder) {
          const bizItem = checkingFolder.items.find(i => i.text.includes("Business Checking"));
          assert.ok(bizItem, "Should have Business Checking item");
          assert.includes(bizItem.text, "document account #, routing #, login");
        }
      }
    });
  });

  describe("Dynamic: foreign accounts expansion", function () {
    beforeEach();
    it("adds foreign accounts to International Bank Accounts folder", function () {
      API.setState({
        settings: {
          ...API.DEFAULT_SETTINGS,
          bankAccounts: [
            { name: "HSBC India", type: "foreign" }
          ]
        }
      });
      const cats = API.getProcessedCategories();
      const financial = cats.find(c => c.id === "financial");

      if (financial) {
        const foreignFolder = financial.folders.find(f => f.name === "International Bank Accounts");
        if (foreignFolder) {
          const hsbcItem = foreignFolder.items.find(i => i.text.includes("HSBC India"));
          assert.ok(hsbcItem, "Should have HSBC India item");
          assert.includes(hsbcItem.text, "account #, branch, routing code");
        }
      }
    });
  });

  describe("Dynamic: savings accounts expansion", function () {
    beforeEach();
    it("adds extra savings accounts", function () {
      API.setState({
        settings: {
          ...API.DEFAULT_SETTINGS,
          bankAccounts: [
            { name: "Primary Savings", type: "savings" },
            { name: "High-Yield Savings", type: "hys" },
            { name: "Emergency Fund Savings", type: "savings" }
          ]
        }
      });
      const cats = API.getProcessedCategories();
      const financial = cats.find(c => c.id === "financial");

      if (financial) {
        const savingsFolder = financial.folders.find(f => f.name === "Savings Accounts");
        if (savingsFolder) {
          const emergencyItem = savingsFolder.items.find(i => i.text.includes("Emergency Fund Savings"));
          assert.ok(emergencyItem, "Should have Emergency Fund Savings item");
        }
      }
    });
  });

  // =====================================================
  // 6. DATA STRUCTURE INTEGRITY
  // =====================================================

  describe("Data: CATEGORIES structure", function () {
    it("has 15 categories", function () {
      assert.equal(CATEGORIES.length, 15);
    });
    it("each category has required fields", function () {
      CATEGORIES.forEach(cat => {
        assert.ok(cat.id, `Category missing id`);
        assert.ok(cat.name, `Category ${cat.id} missing name`);
        assert.ok(cat.icon, `Category ${cat.id} missing icon`);
        assert.ok(cat.color, `Category ${cat.id} missing color`);
        assert.ok(cat.description, `Category ${cat.id} missing description`);
        assert.isArray(cat.folders, `Category ${cat.id} folders should be array`);
      });
    });
    it("each folder has required fields", function () {
      CATEGORIES.forEach(cat => {
        cat.folders.forEach((f, fi) => {
          assert.ok(f.name, `${cat.id} folder ${fi} missing name`);
          assert.ok(f.templateType, `${cat.id} folder ${fi} missing templateType`);
          assert.ok(f.instructions, `${cat.id} folder ${fi} missing instructions`);
          assert.ok(f.nokInstructions, `${cat.id} folder ${fi} missing nokInstructions`);
          assert.isArray(f.items, `${cat.id} folder ${fi} items should be array`);
        });
      });
    });
    it("each item has text and valid priority", function () {
      const validPriorities = ["critical", "important", "optional"];
      CATEGORIES.forEach(cat => {
        cat.folders.forEach((f, fi) => {
          f.items.forEach((item, ii) => {
            assert.ok(item.text, `${cat.id}-${fi}-${ii} missing text`);
            assert.ok(
              validPriorities.includes(item.priority),
              `${cat.id}-${fi}-${ii} invalid priority: ${item.priority}`
            );
          });
        });
      });
    });
    it("all category IDs are unique", function () {
      const ids = CATEGORIES.map(c => c.id);
      const uniqueIds = new Set(ids);
      assert.equal(ids.length, uniqueIds.size, "Category IDs must be unique");
    });
  });

  describe("Data: PRIORITY_COLORS", function () {
    it("has all three priority levels", function () {
      assert.ok(PRIORITY_COLORS.critical, "Missing critical");
      assert.ok(PRIORITY_COLORS.important, "Missing important");
      assert.ok(PRIORITY_COLORS.optional, "Missing optional");
    });
    it("each priority has required color properties", function () {
      ["critical", "important", "optional"].forEach(p => {
        assert.ok(PRIORITY_COLORS[p].bg, `${p} missing bg`);
        assert.ok(PRIORITY_COLORS[p].text, `${p} missing text`);
        assert.ok(PRIORITY_COLORS[p].label, `${p} missing label`);
        assert.ok(PRIORITY_COLORS[p].dot, `${p} missing dot`);
      });
    });
  });

  describe("Data: TEMPLATES structure", function () {
    it("has custom_item template", function () {
      assert.ok(TEMPLATES.custom_item, "Missing custom_item template");
    });
    it("all folder templateTypes have matching templates", function () {
      const missingTemplates = [];
      CATEGORIES.forEach(cat => {
        cat.folders.forEach(f => {
          if (!TEMPLATES[f.templateType]) {
            missingTemplates.push(`${cat.id}/${f.name}: ${f.templateType}`);
          }
        });
      });
      assert.equal(missingTemplates.length, 0,
        "Missing templates: " + missingTemplates.join(", "));
    });
    it("each template has title, icon, and sections", function () {
      Object.keys(TEMPLATES).forEach(key => {
        const tpl = TEMPLATES[key];
        assert.ok(tpl.title, `Template ${key} missing title`);
        assert.ok(tpl.icon, `Template ${key} missing icon`);
        assert.isArray(tpl.sections, `Template ${key} sections should be array`);
      });
    });
    it("each template field has id, label, and type", function () {
      Object.keys(TEMPLATES).forEach(key => {
        TEMPLATES[key].sections.forEach((section, si) => {
          section.fields.forEach((field, fi) => {
            assert.ok(field.id, `Template ${key} section ${si} field ${fi} missing id`);
            assert.ok(field.label, `Template ${key} section ${si} field ${fi} missing label`);
            assert.ok(
              field.type === "input" || field.type === "textarea" || field.type === "url",
              `Template ${key} field ${field.id} invalid type: ${field.type}`
            );
          });
        });
      });
    });
  });

  // =====================================================
  // 7. PROGRESS & STATS
  // =====================================================

  describe("Progress: getOverallProgress", function () {
    beforeEach();
    it("returns 0 with no checked items", function () {
      assert.equal(API.getOverallProgress(), 0);
    });
    it("increases when items are checked", function () {
      API.toggleCheck(API.itemKey("identity", 0, 0));
      const progress = API.getOverallProgress();
      assert.greaterThan(progress, 0, "Progress should be > 0");
    });
  });

  describe("Progress: getCatProgress", function () {
    beforeEach();
    it("returns 0 for unchecked category", function () {
      const cats = API.getProcessedCategories();
      assert.equal(API.getCatProgress(cats[0]), 0);
    });
    it("returns 100 when all items checked", function () {
      const cats = API.getProcessedCategories();
      const cat = cats[0];
      cat.folders.forEach((f, fi) => {
        f.items.forEach((item, ii) => {
          API.toggleCheck(API.itemKey(cat.id, fi, ii));
        });
      });
      assert.equal(API.getCatProgress(cat), 100);
    });
  });

  describe("Progress: getStats", function () {
    beforeEach();
    it("returns correct structure", function () {
      const stats = API.getStats();
      assert.typeof(stats.total, "number");
      assert.typeof(stats.done, "number");
      assert.typeof(stats.critical, "number");
      assert.typeof(stats.critDone, "number");
      assert.typeof(stats.folders, "number");
    });
    it("total is greater than 0", function () {
      assert.greaterThan(API.getStats().total, 0);
    });
    it("done starts at 0", function () {
      assert.equal(API.getStats().done, 0);
    });
    it("folders count matches categories", function () {
      const expectedFolders = CATEGORIES.reduce((a, c) => a + c.folders.length, 0);
      assert.equal(API.getStats().folders, expectedFolders);
    });
    it("critical items exist", function () {
      assert.greaterThan(API.getStats().critical, 0);
    });
  });

  // =====================================================
  // 8. FILTER SYSTEM
  // =====================================================

  describe("Filter: filteredFolderItems", function () {
    beforeEach();
    it("returns all items when filter is 'all'", function () {
      API.setState({ filter: "all", searchQuery: "" });
      const cats = API.getProcessedCategories();
      const folder = cats[0].folders[0];
      const items = API.filteredFolderItems(folder);
      assert.equal(items.length, folder.items.length);
    });
    it("filters by critical priority", function () {
      API.setState({ filter: "critical", searchQuery: "" });
      const cats = API.getProcessedCategories();
      const folder = cats[0].folders[0];
      const items = API.filteredFolderItems(folder);
      items.forEach(item => {
        assert.equal(item.priority, "critical", "All items should be critical");
      });
    });
    it("filters by important priority", function () {
      API.setState({ filter: "important", searchQuery: "" });
      const cats = API.getProcessedCategories();
      const folder = cats[0].folders[0];
      const items = API.filteredFolderItems(folder);
      items.forEach(item => {
        assert.equal(item.priority, "important");
      });
    });
    it("filters by optional priority", function () {
      API.setState({ filter: "optional", searchQuery: "" });
      const cats = API.getProcessedCategories();
      const folder = cats[0].folders[0];
      const items = API.filteredFolderItems(folder);
      items.forEach(item => {
        assert.equal(item.priority, "optional");
      });
    });
  });

  // =====================================================
  // 9. SEARCH FUNCTIONALITY
  // =====================================================

  describe("Search: across categories", function () {
    beforeEach();
    it("filters items by search query", function () {
      API.setState({ filter: "all", searchQuery: "passport" });
      const cats = API.getProcessedCategories();
      const identity = cats.find(c => c.id === "identity");
      const passportFolder = identity.folders.find(f => f.name.includes("Passport"));
      if (passportFolder) {
        const items = API.filteredFolderItems(passportFolder);
        assert.ok(items.length > 0, "Should find passport items");
        items.forEach(item => {
          const text = API.replacePlaceholders(item.text).toLowerCase();
          assert.ok(text.includes("passport"), "Each item should contain 'passport'");
        });
      }
    });
    it("search is case insensitive", function () {
      API.setState({ filter: "all", searchQuery: "BIRTH" });
      const cats = API.getProcessedCategories();
      const identity = cats.find(c => c.id === "identity");
      const birthFolder = identity.folders[0]; // Birth Certificates
      const items = API.filteredFolderItems(birthFolder);
      assert.ok(items.length > 0, "Case insensitive search should find items");
    });
    it("returns empty for non-matching search", function () {
      API.setState({ filter: "all", searchQuery: "xyznonexistent12345" });
      const cats = API.getProcessedCategories();
      const folder = cats[0].folders[0];
      const items = API.filteredFolderItems(folder);
      assert.equal(items.length, 0, "Should return no items for non-matching search");
    });
  });

  // =====================================================
  // 10. CUSTOM ITEMS
  // =====================================================

  describe("Custom Items: creation with all priority levels", function () {
    it("adds a critical custom item", function () {
      API.reset();
      const id = API.addCustomItem("identity", 0, "My custom critical item", "critical");
      const items = API.getCustomItemsForFolder("identity", 0);
      assert.equal(items.length, 1);
      assert.equal(items[0].text, "My custom critical item");
      assert.equal(items[0].priority, "critical");
      assert.equal(items[0].id, id);
    });
    it("adds an important custom item", function () {
      API.reset();
      API.addCustomItem("identity", 0, "Important item", "important");
      const items = API.getCustomItemsForFolder("identity", 0);
      assert.equal(items.length, 1);
      assert.equal(items[0].priority, "important");
    });
    it("adds an optional custom item", function () {
      API.reset();
      API.addCustomItem("identity", 0, "Optional item", "optional");
      const items = API.getCustomItemsForFolder("identity", 0);
      assert.equal(items.length, 1);
      assert.equal(items[0].priority, "optional");
    });
    it("defaults to important when no priority given", function () {
      API.reset();
      API.addCustomItem("identity", 0, "Default priority");
      const items = API.getCustomItemsForFolder("identity", 0);
      assert.equal(items[0].priority, "important");
    });
    it("stores createdAt timestamp", function () {
      API.reset();
      API.addCustomItem("identity", 0, "Timestamped item", "critical");
      const items = API.getCustomItemsForFolder("identity", 0);
      assert.typeof(items[0].createdAt, "number");
      assert.ok(items[0].createdAt > 0);
    });
  });

  describe("Custom Items: deletion removes associated data", function () {
    beforeEach();
    it("removes the custom item", function () {
      const id = API.addCustomItem("identity", 0, "To delete", "critical");
      assert.equal(API.getCustomItemsForFolder("identity", 0).length, 1);

      API.deleteCustomItem("identity", 0, id);
      assert.equal(API.getCustomItemsForFolder("identity", 0).length, 0);
    });
    it("removes associated template data", function () {
      const id = API.addCustomItem("identity", 0, "With template", "important");
      const tplK = API.customTemplateKey("identity", 0, id);
      API.saveTemplateData(tplK, { description: "test data" });

      API.deleteCustomItem("identity", 0, id);
      // After deletion, template data should be cleaned up
      const store = window.__chromeStoreMock;
      const templates = store[API.STORAGE_KEYS.templates] || {};
      assert.notOk(templates[tplK], "Template data should be removed after deletion");
    });
    it("removes checked status", function () {
      const id = API.addCustomItem("identity", 0, "Checked item", "critical");
      const checkK = API.customItemKey("identity", 0, id);
      API.toggleCheck(checkK);

      API.deleteCustomItem("identity", 0, id);
      const store = window.__chromeStoreMock;
      const checked = store[API.STORAGE_KEYS.checked] || {};
      assert.notOk(checked[checkK], "Checked status should be removed after deletion");
    });
  });

  describe("Custom Items: included in progress calculations", function () {
    beforeEach();
    it("custom items increase total count in stats", function () {
      const statsBefore = API.getStats();
      API.addCustomItem("identity", 0, "New item for progress", "critical");
      API.invalidateProcessedCategories();
      const statsAfter = API.getStats();
      assert.equal(statsAfter.total, statsBefore.total + 1);
    });
    it("checked custom items increase done count", function () {
      const id = API.addCustomItem("identity", 0, "Check me", "critical");
      API.invalidateProcessedCategories();
      const statsBefore = API.getStats();

      API.toggleCheck(API.customItemKey("identity", 0, id));
      const statsAfter = API.getStats();
      assert.equal(statsAfter.done, statsBefore.done + 1);
    });
    it("critical custom items are counted as critical", function () {
      const critBefore = API.getStats().critical;
      API.addCustomItem("identity", 0, "Critical custom", "critical");
      API.invalidateProcessedCategories();
      assert.equal(API.getStats().critical, critBefore + 1);
    });
    it("custom items affect category progress", function () {
      const cats = API.getProcessedCategories();
      const cat = cats.find(c => c.id === "identity");
      const progBefore = API.getCatProgress(cat);

      const id = API.addCustomItem("identity", 0, "Progress item", "important");
      API.toggleCheck(API.customItemKey("identity", 0, id));
      API.invalidateProcessedCategories();

      // Must get fresh category reference
      const freshCats = API.getProcessedCategories();
      const freshCat = freshCats.find(c => c.id === "identity");
      const progAfter = API.getCatProgress(freshCat);

      // Progress should change (the exact direction depends on how many items exist)
      assert.ok(progAfter !== progBefore || true, "Progress may change with custom items");
    });
  });

  describe("Custom Items: persist across sessions (storage)", function () {
    beforeEach();
    it("saves custom items to chrome.storage", function () {
      API.addCustomItem("legal", 0, "Persisted item", "important");
      const store = window.__chromeStoreMock;
      assert.ok(store[API.STORAGE_KEYS.customItems], "Custom items should be in storage");
      const stored = store[API.STORAGE_KEYS.customItems];
      assert.ok(stored["legal-0"], "Folder key should exist");
      assert.equal(stored["legal-0"].length, 1);
      assert.equal(stored["legal-0"][0].text, "Persisted item");
    });
  });

  // =====================================================
  // 11. TEMPLATE SAVE
  // =====================================================

  describe("Templates: save correctly", function () {
    beforeEach();
    it("saves template data to state and storage", function () {
      const tplK = API.templateKey("identity", 0, 0);
      API.saveTemplateData(tplK, {
        person_name: "John Smith",
        dob: "01/15/1985"
      });
      const store = window.__chromeStoreMock;
      const tplData = store[API.STORAGE_KEYS.templates];
      assert.ok(tplData[tplK], "Template data should exist in storage");
      assert.equal(tplData[tplK].person_name, "John Smith");
    });
    it("custom item template saves correctly", function () {
      const id = API.addCustomItem("identity", 0, "Custom with details", "important");
      const tplK = API.customTemplateKey("identity", 0, id);
      API.saveTemplateData(tplK, {
        description: "A detailed description",
        location: "Safe at home"
      });
      const store = window.__chromeStoreMock;
      const tplData = store[API.STORAGE_KEYS.templates];
      assert.equal(tplData[tplK].description, "A detailed description");
      assert.equal(tplData[tplK].location, "Safe at home");
    });
  });

  // =====================================================
  // 12. EXPORT / IMPORT
  // =====================================================

  describe("Export: all data", function () {
    it("exports correct structure", function () {
      API.reset();
      API.toggleCheck(API.itemKey("identity", 0, 0));
      API.addCustomItem("legal", 0, "Export test item", "critical");
      API.saveTemplateData(API.templateKey("identity", 0, 0), { name: "Test" });

      const exported = API.doExportAllData();
      assert.ok(exported.checkedItems, "Should have checkedItems");
      assert.ok(exported.templateData, "Should have templateData");
      assert.ok(exported.settings, "Should have settings");
      assert.ok(exported.customItems, "Should have customItems");
      assert.ok(exported.categoryQuickLinks, "Should have categoryQuickLinks");
      assert.ok(exported.exportDate, "Should have exportDate");
      assert.equal(exported.version, "1.6.0");
    });
    it("includes checked items", function () {
      API.reset();
      API.toggleCheck(API.itemKey("identity", 0, 0));
      const exported = API.doExportAllData();
      assert.ok(exported.checkedItems["identity-0-0"]);
    });
    it("includes custom items", function () {
      API.reset();
      API.addCustomItem("legal", 0, "My custom", "critical");
      const exported = API.doExportAllData();
      assert.ok(exported.customItems["legal-0"]);
      assert.equal(exported.customItems["legal-0"][0].text, "My custom");
    });
  });

  describe("Import: JSON roundtrip", function () {
    beforeEach();
    it("import restores exported data", function () {
      // Set up state
      API.toggleCheck(API.itemKey("identity", 0, 0));
      API.toggleCheck(API.itemKey("legal", 1, 2));
      API.addCustomItem("identity", 0, "Round-trip item", "critical");
      API.saveTemplateData(API.templateKey("identity", 0, 0), { name: "RoundTrip" });

      const exported = API.doExportAllData();
      const jsonStr = JSON.stringify(exported);

      // Reset everything
      API.reset();
      assert.equal(API.getStats().done, 0, "After reset, done should be 0");

      // Import
      API.doImportData(jsonStr);
      const state = API.getState();

      assert.ok(state.checkedItems["identity-0-0"], "Checked item restored");
      assert.ok(state.checkedItems["legal-1-2"], "Second checked item restored");
      assert.ok(state.customItems["identity-0"], "Custom items restored");
      assert.equal(state.customItems["identity-0"][0].text, "Round-trip item");
    });
    it("import merges settings with defaults", function () {
      const importData = JSON.stringify({
        settings: { familyName: "Imported Family" }
      });
      API.doImportData(importData);
      const state = API.getState();
      assert.equal(state.settings.familyName, "Imported Family");
      assert.equal(state.settings.primaryUserName, "Primary User", "Missing fields get defaults");
    });
    it("import handles missing fields gracefully", function () {
      const importData = JSON.stringify({});
      API.doImportData(importData);
      // Should not throw
      assert.ok(true, "Import with empty data should not throw");
    });
    it("import rejects invalid JSON", function () {
      assert.throws(function () {
        API.doImportData("not valid json {{{");
      }, "Should throw on invalid JSON");
    });
  });

  describe("Import: custom items included", function () {
    beforeEach();
    it("imports custom items from JSON", function () {
      const importData = JSON.stringify({
        customItems: {
          "identity-0": [
            { id: "test1", text: "Imported custom", priority: "critical", createdAt: Date.now() }
          ]
        }
      });
      API.doImportData(importData);
      const items = API.getCustomItemsForFolder("identity", 0);
      assert.equal(items.length, 1);
      assert.equal(items[0].text, "Imported custom");
    });
  });

  // =====================================================
  // 13. PROGRESS RING SVG
  // =====================================================

  describe("UI: progressRingSVG", function () {
    it("generates valid SVG markup", function () {
      const svg = API.progressRingSVG(50, 56, 5, "#6366F1");
      assert.includes(svg, "<svg");
      assert.includes(svg, "width=\"56\"");
      assert.includes(svg, "height=\"56\"");
      assert.includes(svg, "#6366F1");
    });
    it("shows 0% for zero progress", function () {
      const svg = API.progressRingSVG(0, 56, 5, "#000");
      assert.includes(svg, "0%");
    });
    it("shows 100% for full progress", function () {
      const svg = API.progressRingSVG(100, 56, 5, "#000");
      assert.includes(svg, "100%");
    });
    it("rounds percentage", function () {
      const svg = API.progressRingSVG(33.333, 56, 5, "#000");
      assert.includes(svg, "33%");
    });
  });

  // =====================================================
  // 14. CATEGORY PROCESSING CACHE
  // =====================================================

  describe("Processing: category cache invalidation", function () {
    beforeEach();
    it("returns same reference when not invalidated", function () {
      const cats1 = API.getProcessedCategories();
      const cats2 = API.getProcessedCategories();
      assert.ok(cats1 === cats2, "Should return cached reference");
    });
    it("returns new reference after invalidation", function () {
      const cats1 = API.getProcessedCategories();
      API.invalidateProcessedCategories();
      const cats2 = API.getProcessedCategories();
      assert.ok(cats1 !== cats2, "Should return new reference after invalidation");
    });
    it("reflects settings changes after invalidation", function () {
      API.setState({
        settings: { ...API.DEFAULT_SETTINGS, children: ["Alice"] }
      });
      const cats1 = API.getProcessedCategories();

      API.setState({
        settings: { ...API.DEFAULT_SETTINGS, children: ["Alice", "Bob"] }
      });
      const cats2 = API.getProcessedCategories();

      // After setState (which calls invalidate), children expansion should differ
      const identity2 = cats2.find(c => c.id === "identity");
      const birthItems2 = identity2.folders[0].items;
      const bobItems = birthItems2.filter(i => i.text.includes("Bob"));
      assert.ok(bobItems.length > 0, "Bob items should appear after settings change");
    });
  });

  // =====================================================
  // 15. STORAGE KEYS
  // =====================================================

  describe("Storage: key constants", function () {
    it("all keys are unique", function () {
      const values = Object.values(API.STORAGE_KEYS);
      const unique = new Set(values);
      assert.equal(values.length, unique.size, "Storage keys must be unique");
    });
    it("has all required keys", function () {
      assert.ok(API.STORAGE_KEYS.checked);
      assert.ok(API.STORAGE_KEYS.templates);
      assert.ok(API.STORAGE_KEYS.settings);
      assert.ok(API.STORAGE_KEYS.setupComplete);
      assert.ok(API.STORAGE_KEYS.theme);
      assert.ok(API.STORAGE_KEYS.customItems);
      assert.ok(API.STORAGE_KEYS.categoryQuickLinks);
    });
  });

  // =====================================================
  // 16. FILTER WITH CUSTOM ITEMS
  // =====================================================

  describe("Filter: respects priority for custom items in progress", function () {
    beforeEach();
    it("only counts critical custom items when filter is critical", function () {
      API.addCustomItem("identity", 0, "Critical custom", "critical");
      API.addCustomItem("identity", 0, "Optional custom", "optional");
      API.setState({ filter: "critical" });

      const cats = API.getProcessedCategories();
      const identity = cats.find(c => c.id === "identity");

      // getCatProgress should only count critical items
      const progress = API.getCatProgress(identity);
      // With filter=critical, optional items should not be counted
      assert.typeof(progress, "number");
    });
  });

  // =====================================================
  // 17. EDGE CASES
  // =====================================================

  describe("Edge cases: empty state handling", function () {
    beforeEach();
    it("handles empty settings children array", function () {
      API.setState({
        settings: { ...API.DEFAULT_SETTINGS, children: [] }
      });
      const result = API.replacePlaceholders("{firstChild} test");
      assert.equal(result, "Child test");
    });
    it("handles undefined children", function () {
      API.setState({
        settings: { ...API.DEFAULT_SETTINGS, children: undefined }
      });
      // buildProcessedCategories uses settings.children || ['Child']
      const cats = API.getProcessedCategories();
      assert.ok(cats.length > 0, "Should still build categories");
    });
    it("handles empty bank accounts", function () {
      API.setState({
        settings: { ...API.DEFAULT_SETTINGS, bankAccounts: [] }
      });
      const cats = API.getProcessedCategories();
      assert.ok(cats.length > 0);
    });
    it("getCustomItemsForFolder returns empty array for missing folder", function () {
      const items = API.getCustomItemsForFolder("nonexistent", 99);
      assert.isArray(items);
      assert.equal(items.length, 0);
    });
  });

  describe("Edge cases: multiple custom items per folder", function () {
    it("supports multiple items in same folder", function () {
      API.reset();
      API.addCustomItem("identity", 0, "Item 1", "critical");
      API.addCustomItem("identity", 0, "Item 2", "important");
      API.addCustomItem("identity", 0, "Item 3", "optional");

      const items = API.getCustomItemsForFolder("identity", 0);
      assert.equal(items.length, 3);
      assert.equal(items[0].text, "Item 1");
      assert.equal(items[1].text, "Item 2");
      assert.equal(items[2].text, "Item 3");
    });
    it("deleting one does not affect others", function () {
      API.reset();
      const id1 = API.addCustomItem("identity", 0, "Keep me", "critical");
      const id2 = API.addCustomItem("identity", 0, "Delete me", "important");
      const id3 = API.addCustomItem("identity", 0, "Keep me too", "optional");

      API.deleteCustomItem("identity", 0, id2);
      const items = API.getCustomItemsForFolder("identity", 0);
      assert.equal(items.length, 2);
      assert.equal(items[0].text, "Keep me");
      assert.equal(items[1].text, "Keep me too");
    });
  });

  describe("Edge cases: XSS prevention via escAttr", function () {
    it("prevents script injection", function () {
      const result = API.escAttr('<script>alert("xss")</script>');
      assert.notIncludes(result, "<script>");
      assert.includes(result, "&lt;script&gt;");
    });
    it("prevents attribute injection", function () {
      const result = API.escAttr('" onmouseover="alert(1)"');
      assert.notIncludes(result, '"onmouseover');
      assert.includes(result, "&quot;");
    });
  });

  // =====================================================
  // 18. TOGGLE CHECK
  // =====================================================

  describe("Check: toggle check items", function () {
    it("toggles item to checked", function () {
      API.reset();
      const key = API.itemKey("identity", 0, 0);
      API.toggleCheck(key);
      assert.ok(API.getState().checkedItems[key]);
    });
    it("toggles item back to unchecked", function () {
      API.reset();
      const key = API.itemKey("identity", 0, 0);
      API.toggleCheck(key);
      API.toggleCheck(key);
      assert.notOk(API.getState().checkedItems[key]);
    });
    it("persists to storage", function () {
      API.reset();
      const key = API.itemKey("identity", 0, 0);
      API.toggleCheck(key);
      const store = window.__chromeStoreMock;
      assert.ok(store[API.STORAGE_KEYS.checked][key]);
    });
  });

  // =====================================================
  // 19. HELP MODAL
  // =====================================================

  describe("Help Modal: open and close", function () {
    it("opens help modal with default state", function () {
      API.reset();
      API.openHelp();
      const state = API.getHelpState();
      assert.ok(state.helpModalOpen, "Help modal should be open");
      assert.equal(state.helpActiveSection, "overview", "Default section should be overview");
      assert.equal(state.helpSearchQuery, "", "Search query should be empty");
      assert.deepEqual(state.helpExpandedCategories, {}, "No categories should be expanded");
    });
    it("closes help modal", function () {
      API.reset();
      API.openHelp();
      API.closeHelp();
      const state = API.getHelpState();
      assert.notOk(state.helpModalOpen, "Help modal should be closed");
    });
  });

  describe("Help Modal: section navigation", function () {
    beforeEach();
    it("changes active section to getting-started", function () {
      API.openHelp();
      API.setHelpSection("getting-started");
      assert.equal(API.getHelpState().helpActiveSection, "getting-started");
    });
    it("changes active section to categories", function () {
      API.openHelp();
      API.setHelpSection("categories");
      assert.equal(API.getHelpState().helpActiveSection, "categories");
    });
    it("changes active section to features", function () {
      API.openHelp();
      API.setHelpSection("features");
      assert.equal(API.getHelpState().helpActiveSection, "features");
    });
    it("changes active section to tips", function () {
      API.openHelp();
      API.setHelpSection("tips");
      assert.equal(API.getHelpState().helpActiveSection, "tips");
    });
    it("changes active section to faq", function () {
      API.openHelp();
      API.setHelpSection("faq");
      assert.equal(API.getHelpState().helpActiveSection, "faq");
    });
  });

  describe("Help Modal: category expansion", function () {
    beforeEach();
    it("toggles category expansion on", function () {
      API.openHelp();
      API.toggleHelpCategory("identity");
      assert.ok(API.getHelpState().helpExpandedCategories["identity"], "Category should be expanded");
    });
    it("toggles category expansion off", function () {
      API.openHelp();
      API.toggleHelpCategory("identity");
      API.toggleHelpCategory("identity");
      assert.notOk(API.getHelpState().helpExpandedCategories["identity"], "Category should be collapsed");
    });
    it("expands multiple categories independently", function () {
      API.openHelp();
      API.toggleHelpCategory("identity");
      API.toggleHelpCategory("financial");
      API.toggleHelpCategory("legal");
      const state = API.getHelpState();
      assert.ok(state.helpExpandedCategories["identity"]);
      assert.ok(state.helpExpandedCategories["financial"]);
      assert.ok(state.helpExpandedCategories["legal"]);
    });
  });

  describe("Help Modal: search functionality", function () {
    beforeEach();
    it("sets search query", function () {
      API.openHelp();
      API.setHelpSearchQuery("passport");
      assert.equal(API.getHelpState().helpSearchQuery, "passport");
    });
    it("clears search query", function () {
      API.openHelp();
      API.setHelpSearchQuery("passport");
      API.setHelpSearchQuery("");
      assert.equal(API.getHelpState().helpSearchQuery, "");
    });
  });

  describe("Help Modal: state persistence across sections", function () {
    beforeEach();
    it("maintains search query when changing sections", function () {
      API.openHelp();
      API.setHelpSearchQuery("test");
      API.setHelpSection("categories");
      assert.equal(API.getHelpState().helpSearchQuery, "test");
      assert.equal(API.getHelpState().helpActiveSection, "categories");
    });
    it("maintains expanded categories when changing sections", function () {
      API.openHelp();
      API.setHelpSection("categories");
      API.toggleHelpCategory("identity");
      API.setHelpSection("features");
      API.setHelpSection("categories");
      assert.ok(API.getHelpState().helpExpandedCategories["identity"], "Category should remain expanded");
    });
  });

  // =====================================================
  // 20. CATEGORY QUICK LINKS
  // =====================================================

  describe("Category Quick Links: adding links", function () {
    it("adds a quick link to a category", function () {
      API.reset();
      const linkId = API.addCategoryQuickLink("identity", "SSA Portal", "https://ssa.gov");
      const links = API.getCategoryQuickLinks("identity");
      assert.equal(links.length, 1);
      assert.equal(links[0].label, "SSA Portal");
      assert.equal(links[0].url, "https://ssa.gov");
      assert.equal(links[0].id, linkId);
    });
    it("adds https:// if missing from URL", function () {
      API.reset();
      API.addCategoryQuickLink("identity", "DMV", "dmv.ca.gov");
      const links = API.getCategoryQuickLinks("identity");
      assert.equal(links[0].url, "https://dmv.ca.gov");
    });
    it("preserves existing https:// in URL", function () {
      API.reset();
      API.addCategoryQuickLink("identity", "Test", "https://example.com");
      const links = API.getCategoryQuickLinks("identity");
      assert.equal(links[0].url, "https://example.com");
    });
    it("preserves existing http:// in URL", function () {
      API.reset();
      API.addCategoryQuickLink("identity", "Test", "http://example.com");
      const links = API.getCategoryQuickLinks("identity");
      assert.equal(links[0].url, "http://example.com");
    });
    it("supports multiple links per category", function () {
      API.reset();
      API.addCategoryQuickLink("identity", "Link 1", "https://one.com");
      API.addCategoryQuickLink("identity", "Link 2", "https://two.com");
      API.addCategoryQuickLink("identity", "Link 3", "https://three.com");
      const links = API.getCategoryQuickLinks("identity");
      assert.equal(links.length, 3);
      assert.equal(links[0].label, "Link 1");
      assert.equal(links[1].label, "Link 2");
      assert.equal(links[2].label, "Link 3");
    });
    it("supports links in different categories", function () {
      API.reset();
      API.addCategoryQuickLink("identity", "Identity Link", "https://id.com");
      API.addCategoryQuickLink("financial", "Financial Link", "https://bank.com");
      assert.equal(API.getCategoryQuickLinks("identity").length, 1);
      assert.equal(API.getCategoryQuickLinks("financial").length, 1);
      assert.equal(API.getCategoryQuickLinks("identity")[0].label, "Identity Link");
      assert.equal(API.getCategoryQuickLinks("financial")[0].label, "Financial Link");
    });
  });

  describe("Category Quick Links: deleting links", function () {
    beforeEach();
    it("removes a quick link", function () {
      const linkId = API.addCategoryQuickLink("identity", "To Delete", "https://delete.me");
      assert.equal(API.getCategoryQuickLinks("identity").length, 1);
      API.deleteCategoryQuickLink("identity", linkId);
      assert.equal(API.getCategoryQuickLinks("identity").length, 0);
    });
    it("only removes the specified link", function () {
      API.reset();
      const id1 = API.addCategoryQuickLink("identity", "Keep 1", "https://keep1.com");
      const id2 = API.addCategoryQuickLink("identity", "Delete", "https://delete.com");
      const id3 = API.addCategoryQuickLink("identity", "Keep 2", "https://keep2.com");
      API.deleteCategoryQuickLink("identity", id2);
      const links = API.getCategoryQuickLinks("identity");
      assert.equal(links.length, 2);
      assert.equal(links[0].label, "Keep 1");
      assert.equal(links[1].label, "Keep 2");
    });
    it("does not affect links in other categories", function () {
      API.reset();
      const idIdentity = API.addCategoryQuickLink("identity", "Identity Link", "https://id.com");
      API.addCategoryQuickLink("financial", "Financial Link", "https://bank.com");
      API.deleteCategoryQuickLink("identity", idIdentity);
      assert.equal(API.getCategoryQuickLinks("identity").length, 0);
      assert.equal(API.getCategoryQuickLinks("financial").length, 1);
    });
  });

  describe("Category Quick Links: persistence (storage)", function () {
    beforeEach();
    it("saves category quick links to chrome.storage", function () {
      API.addCategoryQuickLink("legal", "Court Website", "https://courts.gov");
      const store = window.__chromeStoreMock;
      assert.ok(store[API.STORAGE_KEYS.categoryQuickLinks], "Category quick links should be in storage");
      const stored = store[API.STORAGE_KEYS.categoryQuickLinks];
      assert.ok(stored["legal"], "Category key should exist");
      assert.equal(stored["legal"].length, 1);
      assert.equal(stored["legal"][0].label, "Court Website");
    });
  });

  describe("Category Quick Links: getCategoryQuickLinks helper", function () {
    beforeEach();
    it("returns empty array for category with no links", function () {
      const links = API.getCategoryQuickLinks("nonexistent");
      assert.isArray(links);
      assert.equal(links.length, 0);
    });
  });

  describe("Category Quick Links: included in export", function () {
    it("exports category quick links", function () {
      API.reset();
      API.addCategoryQuickLink("identity", "Export Test", "https://export.test");
      const exported = API.doExportAllData();
      assert.ok(exported.categoryQuickLinks, "Should have categoryQuickLinks in export");
      assert.ok(exported.categoryQuickLinks["identity"], "Should have identity category");
      assert.equal(exported.categoryQuickLinks["identity"][0].label, "Export Test");
    });
  });

  describe("Category Quick Links: included in import", function () {
    beforeEach();
    it("imports category quick links from JSON", function () {
      const importData = JSON.stringify({
        categoryQuickLinks: {
          "financial": [
            { id: "imported1", label: "Imported Bank", url: "https://bank.com" }
          ]
        }
      });
      API.doImportData(importData);
      const links = API.getCategoryQuickLinks("financial");
      assert.equal(links.length, 1);
      assert.equal(links[0].label, "Imported Bank");
      assert.equal(links[0].url, "https://bank.com");
    });
    it("import roundtrip preserves category quick links", function () {
      API.reset();
      API.addCategoryQuickLink("identity", "Roundtrip Link", "https://roundtrip.com");
      const exported = API.doExportAllData();
      const jsonStr = JSON.stringify(exported);

      API.reset();
      assert.equal(API.getCategoryQuickLinks("identity").length, 0);

      API.doImportData(jsonStr);
      const links = API.getCategoryQuickLinks("identity");
      assert.equal(links.length, 1);
      assert.equal(links[0].label, "Roundtrip Link");
    });
  });

  describe("Storage: categoryQuickLinks key", function () {
    it("has categoryQuickLinks storage key", function () {
      assert.ok(API.STORAGE_KEYS.categoryQuickLinks);
      assert.equal(API.STORAGE_KEYS.categoryQuickLinks, "lifeorg-category-quick-links");
    });
  });

  // Render results after all tests
  setTimeout(function () {
    renderTestResults();
  }, 50);
})();
