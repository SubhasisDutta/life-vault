// Test harness — exposes internal IIFE functions for testing
// This replaces app.js in the test environment by extracting key logic
// into a globally accessible LifeVaultTestAPI object.

(function () {
  "use strict";

  // === STORAGE KEYS ===
  const STORAGE_KEYS = {
    checked: "lifeorg-checked",
    templates: "lifeorg-templates",
    settings: "lifeorg-settings",
    setupComplete: "lifeorg-setup-complete",
    theme: "lifeorg-theme",
    customItems: "lifeorg-custom-items",
    categoryQuickLinks: "lifeorg-category-quick-links"
  };

  // === DEFAULT SETTINGS ===
  const DEFAULT_SETTINGS = {
    familyName: "My Vault",
    primaryUserName: "Primary User",
    partnerName: "",
    children: [],
    householdType: "single", // "single" | "couple" | "family"
    bankAccounts: [
      { name: "Primary Checking", type: "checking" },
      { name: "Primary Savings", type: "savings" },
      { name: "High-Yield Savings", type: "hys" }
    ],
    quickLinks: [],
    theme: "dark"
  };

  // State
  let checkedItems = {};
  let templateData = {};
  let settings = { ...DEFAULT_SETTINGS };
  let setupComplete = false;
  let currentTheme = "dark";
  let customItems = {};
  let categoryQuickLinks = {};

  let activeCategory = null;
  let activeFolder = null;
  let filter = "all";
  let searchQuery = "";
  let showNok = {};
  let modalOpen = null;
  let settingsModalOpen = false;
  let helpModalOpen = false;
  let helpSearchQuery = "";
  let helpActiveSection = "overview";
  let helpExpandedCategories = {};
  let currentSetupStep = 0;
  let customItemModalOpen = null;

  // === HELPERS ===
  function itemKey(catId, fi, ii) { return `${catId}-${fi}-${ii}`; }
  function templateKey(catId, fi, ii) { return `tpl-${catId}-${fi}-${ii}`; }
  function customItemKey(catId, fi, itemId) { return `custom-${catId}-${fi}-${itemId}`; }
  function customTemplateKey(catId, fi, itemId) { return `tpl-custom-${catId}-${fi}-${itemId}`; }
  function folderKey(catId, fi) { return `${catId}-${fi}`; }

  function getCustomItemsForFolder(catId, fi) {
    const key = folderKey(catId, fi);
    return customItems[key] || [];
  }

  function getCategoryQuickLinks(catId) {
    return categoryQuickLinks[catId] || [];
  }

  function generateCustomItemId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }

  function replacePlaceholders(text) {
    if (!text) return text;
    let result = text
      .replace(/\{familyName\}/g, settings.familyName)
      .replace(/\{primaryUser\}/g, settings.primaryUserName)
      .replace(/\{partner\}/g, settings.partnerName || 'Next of Kin');

    // Handle children references
    if (settings.children && settings.children.length > 0) {
      result = result.replace(/\{firstChild\}/g, settings.children[0]);
      result = result.replace(/\{children\}/g, settings.children.join(', '));
    } else {
      // Remove child placeholders if no children
      result = result.replace(/\{firstChild\}/g, '');
      result = result.replace(/\{children\}/g, '');
    }

    return result;
  }

  function escAttr(s) {
    return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function saveData(key, data) {
    chrome.storage.local.set({ [key]: data });
  }

  function applyTheme(theme) {
    currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    saveData(STORAGE_KEYS.theme, theme);
  }

  function getThemeIcon() {
    return currentTheme === 'dark' ? '\u2600\uFE0F' : '\uD83C\uDF19';
  }

  function getThemeLabel() {
    return currentTheme === 'dark' ? 'Light Mode' : 'Dark Mode';
  }

  // Category processing
  let processedCategories = null;

  function getProcessedCategories() {
    if (!processedCategories) {
      processedCategories = buildProcessedCategories();
    }
    return processedCategories;
  }

  function invalidateProcessedCategories() {
    processedCategories = null;
  }

  function buildProcessedCategories() {
    const children = settings.children || [];
    const bankAccounts = settings.bankAccounts || [];

    return CATEGORIES.map(cat => {
      const newFolders = cat.folders.map(folder => {
        let newItems = [];

        folder.items.forEach(item => {
          // Skip child-specific items if no children
          if (item.text.includes('{firstChild}') && children.length === 0) {
            return; // Skip this item entirely
          }
          // Check if this is a child-specific item that should be expanded for all children
          if (item.text.includes('{firstChild}') && children.length > 1) {
            children.forEach((childName, idx) => {
              const childItem = {
                ...item,
                text: item.text.replace(/\{firstChild\}/g, childName),
                _childIndex: idx
              };
              newItems.push(childItem);
            });
          } else if (item.text.includes('Additional children') && children.length > 1) {
            // Skip this item if we already have multiple children listed
          } else if (item.text.includes('Additional children') && children.length === 0) {
            // Skip "Additional children" item if no children at all
          } else {
            newItems.push(item);
          }
        });

        if (folder.name === 'Checking Accounts' && bankAccounts.length > 0) {
          const checkingAccounts = bankAccounts.filter(b => b.type === 'checking');
          checkingAccounts.forEach(account => {
            const exists = newItems.some(item => item.text.includes(account.name));
            if (!exists && account.name !== 'Primary Checking') {
              newItems.splice(2, 0, {
                text: `${account.name} — document account #, routing #, login`,
                priority: 'critical',
                _dynamicBank: true
              });
            }
          });
        }

        if (folder.name === 'Savings Accounts' && bankAccounts.length > 0) {
          const savingsAccounts = bankAccounts.filter(b => b.type === 'savings' || b.type === 'hys');
          savingsAccounts.forEach(account => {
            const exists = newItems.some(item => item.text.includes(account.name));
            if (!exists && !account.name.includes('Primary') && !account.name.includes('High-Yield')) {
              newItems.splice(2, 0, {
                text: `${account.name} — balance & login`,
                priority: 'important',
                _dynamicBank: true
              });
            }
          });
        }

        if (folder.name === 'International Bank Accounts' && bankAccounts.length > 0) {
          const foreignAccounts = bankAccounts.filter(b => b.type === 'foreign');
          foreignAccounts.forEach(account => {
            const exists = newItems.some(item => item.text.includes(account.name));
            if (!exists) {
              newItems.unshift({
                text: `${account.name} — account #, branch, routing code`,
                priority: 'important',
                _dynamicBank: true
              });
            }
          });
        }

        if (folder.name === 'Brokerage & Investment Accounts' && bankAccounts.length > 0) {
          const investmentAccounts = bankAccounts.filter(b => b.type === 'investment');
          investmentAccounts.forEach(account => {
            const exists = newItems.some(item => item.text.includes(account.name));
            if (!exists) {
              newItems.splice(3, 0, {
                text: `${account.name} — account #, login, beneficiaries`,
                priority: 'critical',
                _dynamicBank: true
              });
            }
          });
        }

        if (folder.name === 'Credit Cards' && bankAccounts.length > 0) {
          const creditCards = bankAccounts.filter(b => b.type === 'credit');
          creditCards.forEach(account => {
            const exists = newItems.some(item => item.text.includes(account.name));
            if (!exists) {
              newItems.splice(1, 0, {
                text: `${account.name} — card #, login, autopay status`,
                priority: 'important',
                _dynamicBank: true
              });
            }
          });
        }

        return { ...folder, items: newItems };
      });

      return { ...cat, folders: newFolders };
    });
  }

  function getCatProgress(cat) {
    let total = 0, done = 0;
    cat.folders.forEach((f, fi) => {
      f.items.forEach((item, ii) => {
        if (filter === "all" || item.priority === filter) {
          total++;
          if (checkedItems[itemKey(cat.id, fi, ii)]) done++;
        }
      });
      const folderCustomItems = getCustomItemsForFolder(cat.id, fi);
      folderCustomItems.forEach(ci => {
        if (filter === "all" || ci.priority === filter) {
          total++;
          if (checkedItems[customItemKey(cat.id, fi, ci.id)]) done++;
        }
      });
    });
    return total === 0 ? 0 : (done / total) * 100;
  }

  function getOverallProgress() {
    let total = 0, done = 0;
    getProcessedCategories().forEach(cat => {
      cat.folders.forEach((f, fi) => {
        f.items.forEach((item, ii) => {
          if (filter === "all" || item.priority === filter) {
            total++;
            if (checkedItems[itemKey(cat.id, fi, ii)]) done++;
          }
        });
        const folderCustomItems = getCustomItemsForFolder(cat.id, fi);
        folderCustomItems.forEach(ci => {
          if (filter === "all" || ci.priority === filter) {
            total++;
            if (checkedItems[customItemKey(cat.id, fi, ci.id)]) done++;
          }
        });
      });
    });
    return total === 0 ? 0 : (done / total) * 100;
  }

  function getStats() {
    let total = 0, done = 0, critical = 0, critDone = 0, folders = 0;
    getProcessedCategories().forEach(cat => {
      folders += cat.folders.length;
      cat.folders.forEach((f, fi) => {
        f.items.forEach((item, ii) => {
          total++;
          if (checkedItems[itemKey(cat.id, fi, ii)]) done++;
          if (item.priority === "critical") {
            critical++;
            if (checkedItems[itemKey(cat.id, fi, ii)]) critDone++;
          }
        });
        const folderCustomItems = getCustomItemsForFolder(cat.id, fi);
        folderCustomItems.forEach(ci => {
          total++;
          if (checkedItems[customItemKey(cat.id, fi, ci.id)]) done++;
          if (ci.priority === "critical") {
            critical++;
            if (checkedItems[customItemKey(cat.id, fi, ci.id)]) critDone++;
          }
        });
      });
    });
    return { total, done, critical, critDone, folders };
  }

  function progressRingSVG(progress, size, stroke, color) {
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    const offset = c - (progress / 100) * c;
    return `<svg width="${size}" height="${size}" style="transform:rotate(-90deg)">
      <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="#E5E7EB" stroke-width="${stroke}"/>
      <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${color}" stroke-width="${stroke}"
        stroke-dasharray="${c}" stroke-dashoffset="${offset}" stroke-linecap="round" style="transition:stroke-dashoffset 0.6s ease"/>
      <text x="${size / 2}" y="${size / 2}" text-anchor="middle" dominant-baseline="central"
        style="transform:rotate(90deg);transform-origin:center;font-size:${size * 0.26}px;font-weight:700;fill:${color}">${Math.round(progress)}%</text>
    </svg>`;
  }

  function filteredFolderItems(folder) {
    return folder.items.map((item, ii) => ({ ...item, ii })).filter(item => {
      if (filter !== "all" && item.priority !== filter) return false;
      if (searchQuery) return replacePlaceholders(item.text).toLowerCase().includes(searchQuery.toLowerCase());
      return true;
    });
  }

  // Export/Import
  function doExportAllData() {
    return {
      checkedItems: checkedItems,
      templateData: templateData,
      settings: settings,
      customItems: customItems,
      categoryQuickLinks: categoryQuickLinks,
      exportDate: new Date().toISOString(),
      version: "1.9.0"
    };
  }

  function doImportData(dataStr) {
    const data = JSON.parse(dataStr);
    if (data.checkedItems) {
      checkedItems = data.checkedItems;
      saveData(STORAGE_KEYS.checked, checkedItems);
    }
    if (data.templateData) {
      templateData = data.templateData;
      saveData(STORAGE_KEYS.templates, templateData);
    }
    if (data.settings) {
      settings = { ...DEFAULT_SETTINGS, ...data.settings };
      invalidateProcessedCategories();
      saveData(STORAGE_KEYS.settings, settings);
    }
    if (data.customItems) {
      customItems = data.customItems;
      saveData(STORAGE_KEYS.customItems, customItems);
    }
    if (data.categoryQuickLinks) {
      categoryQuickLinks = data.categoryQuickLinks;
      saveData(STORAGE_KEYS.categoryQuickLinks, categoryQuickLinks);
    }
    return true;
  }

  // Custom items
  function addCustomItem(catId, folderIdx, text, priority) {
    const itemId = generateCustomItemId();
    const key = folderKey(catId, folderIdx);
    if (!customItems[key]) {
      customItems[key] = [];
    }
    customItems[key].push({
      id: itemId,
      text: text,
      priority: priority || 'important',
      createdAt: Date.now()
    });
    saveData(STORAGE_KEYS.customItems, customItems);
    return itemId;
  }

  function deleteCustomItem(catId, fi, itemId) {
    const key = folderKey(catId, fi);
    if (customItems[key]) {
      customItems[key] = customItems[key].filter(item => item.id !== itemId);
      if (customItems[key].length === 0) {
        delete customItems[key];
      }
      saveData(STORAGE_KEYS.customItems, customItems);

      const customTplK = customTemplateKey(catId, fi, itemId);
      const customCheckK = customItemKey(catId, fi, itemId);
      if (templateData[customTplK]) {
        delete templateData[customTplK];
        saveData(STORAGE_KEYS.templates, templateData);
      }
      if (checkedItems[customCheckK]) {
        delete checkedItems[customCheckK];
        saveData(STORAGE_KEYS.checked, checkedItems);
      }
    }
  }

  // Category quick links
  function addCategoryQuickLink(catId, label, url) {
    const linkId = generateCustomItemId();
    if (!categoryQuickLinks[catId]) {
      categoryQuickLinks[catId] = [];
    }
    // Auto-add https:// if missing
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }
    categoryQuickLinks[catId].push({
      id: linkId,
      label: label,
      url: url
    });
    saveData(STORAGE_KEYS.categoryQuickLinks, categoryQuickLinks);
    return linkId;
  }

  function deleteCategoryQuickLink(catId, linkId) {
    if (categoryQuickLinks[catId]) {
      categoryQuickLinks[catId] = categoryQuickLinks[catId].filter(link => link.id !== linkId);
      if (categoryQuickLinks[catId].length === 0) {
        delete categoryQuickLinks[catId];
      }
      saveData(STORAGE_KEYS.categoryQuickLinks, categoryQuickLinks);
    }
  }

  // Expose the test API globally
  window.LifeVaultTestAPI = {
    // Constants
    STORAGE_KEYS,
    DEFAULT_SETTINGS,

    // Key generators
    itemKey,
    templateKey,
    customItemKey,
    customTemplateKey,
    folderKey,

    // Helpers
    replacePlaceholders,
    escAttr,
    generateCustomItemId,
    getThemeIcon,
    getThemeLabel,
    progressRingSVG,

    // Category processing
    getProcessedCategories,
    invalidateProcessedCategories,
    buildProcessedCategories,

    // Progress & stats
    getCatProgress,
    getOverallProgress,
    getStats,
    filteredFolderItems,

    // Theme
    applyTheme,

    // Custom items
    getCustomItemsForFolder,
    addCustomItem,
    deleteCustomItem,

    // Category quick links
    getCategoryQuickLinks,
    addCategoryQuickLink,
    deleteCategoryQuickLink,

    // Export/Import
    doExportAllData,
    doImportData,

    // State getters/setters for test setup
    getState: function () {
      return {
        checkedItems, templateData, settings, setupComplete,
        currentTheme, customItems, categoryQuickLinks, activeCategory, activeFolder,
        filter, searchQuery, showNok, modalOpen, settingsModalOpen,
        helpModalOpen, helpSearchQuery, helpActiveSection,
        helpExpandedCategories, currentSetupStep, customItemModalOpen
      };
    },

    setState: function (patch) {
      if (patch.checkedItems !== undefined) checkedItems = patch.checkedItems;
      if (patch.templateData !== undefined) templateData = patch.templateData;
      if (patch.settings !== undefined) settings = patch.settings;
      if (patch.setupComplete !== undefined) setupComplete = patch.setupComplete;
      if (patch.currentTheme !== undefined) currentTheme = patch.currentTheme;
      if (patch.customItems !== undefined) customItems = patch.customItems;
      if (patch.categoryQuickLinks !== undefined) categoryQuickLinks = patch.categoryQuickLinks;
      if (patch.activeCategory !== undefined) activeCategory = patch.activeCategory;
      if (patch.activeFolder !== undefined) activeFolder = patch.activeFolder;
      if (patch.filter !== undefined) filter = patch.filter;
      if (patch.searchQuery !== undefined) searchQuery = patch.searchQuery;
      if (patch.showNok !== undefined) showNok = patch.showNok;
      if (patch.modalOpen !== undefined) modalOpen = patch.modalOpen;
      if (patch.settingsModalOpen !== undefined) settingsModalOpen = patch.settingsModalOpen;
      if (patch.helpModalOpen !== undefined) helpModalOpen = patch.helpModalOpen;
      if (patch.currentSetupStep !== undefined) currentSetupStep = patch.currentSetupStep;
      if (patch.customItemModalOpen !== undefined) customItemModalOpen = patch.customItemModalOpen;
      invalidateProcessedCategories();
    },

    // Full reset to defaults
    reset: function () {
      checkedItems = {};
      templateData = {};
      settings = { ...DEFAULT_SETTINGS };
      setupComplete = false;
      currentTheme = "dark";
      customItems = {};
      categoryQuickLinks = {};
      activeCategory = null;
      activeFolder = null;
      filter = "all";
      searchQuery = "";
      showNok = {};
      modalOpen = null;
      settingsModalOpen = false;
      helpModalOpen = false;
      helpSearchQuery = "";
      helpActiveSection = "overview";
      helpExpandedCategories = {};
      currentSetupStep = 0;
      customItemModalOpen = null;
      processedCategories = null;
      window.__resetChromeStore();
    },

    // Toggle check
    toggleCheck: function (key) {
      checkedItems[key] = !checkedItems[key];
      saveData(STORAGE_KEYS.checked, checkedItems);
    },

    // Save template data
    saveTemplateData: function (tplKey, data) {
      templateData[tplKey] = data;
      saveData(STORAGE_KEYS.templates, templateData);
    },

    // Help modal functions
    openHelp: function () {
      helpModalOpen = true;
      helpActiveSection = "overview";
      helpSearchQuery = "";
      helpExpandedCategories = {};
    },

    closeHelp: function () {
      helpModalOpen = false;
    },

    setHelpSection: function (section) {
      helpActiveSection = section;
    },

    setHelpSearchQuery: function (query) {
      helpSearchQuery = query;
    },

    toggleHelpCategory: function (catId) {
      helpExpandedCategories[catId] = !helpExpandedCategories[catId];
    },

    getHelpState: function () {
      return {
        helpModalOpen,
        helpActiveSection,
        helpSearchQuery,
        helpExpandedCategories
      };
    }
  };
})();
