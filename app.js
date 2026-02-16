// Family Life Vault — Main Application Engine
// Chrome Extension Tab Page — Vanilla JS, NO inline handlers (CSP compliant)

(function () {
  "use strict";

  // === STORAGE KEYS ===
  const STORAGE_KEYS = {
    checked: "lifeorg-checked",
    templates: "lifeorg-templates",
    settings: "lifeorg-settings",
    setupComplete: "lifeorg-setup-complete",
    theme: "lifeorg-theme",
    customItems: "lifeorg-custom-items"
  };

  // === DEFAULT SETTINGS ===
  const DEFAULT_SETTINGS = {
    familyName: "My Family",
    primaryUserName: "Primary User",
    partnerName: "Partner",
    children: ["Child"],
    bankAccounts: [
      { name: "Primary Checking", type: "checking" },
      { name: "Primary Savings", type: "savings" },
      { name: "High-Yield Savings", type: "hys" }
    ],
    quickLinks: [],
    theme: "dark"
  };

  // State initialized as empty, populated async
  let checkedItems = {};
  let templateData = {};
  let settings = { ...DEFAULT_SETTINGS };
  let setupComplete = false;
  let currentTheme = "dark";
  let customItems = {}; // { "catId-folderIdx": [{ text, priority, id }] }

  // === THEME MANAGEMENT ===
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

  // === STATE ===
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
  let helpExpandedResources = {};
  let helpActiveResourceVideo = null; // tracks which video embed is open: "resourceCatIdx-videoIdx"
  let helpResourceSearchQuery = "";
  let currentSetupStep = 0;
  let customItemModalOpen = null; // { catId, folderIdx } for adding new custom item

  function saveData(key, data) {
    chrome.storage.local.set({ [key]: data });
  }

  // Initialize data from chrome.storage.local
  chrome.storage.local.get([
    STORAGE_KEYS.checked,
    STORAGE_KEYS.templates,
    STORAGE_KEYS.settings,
    STORAGE_KEYS.setupComplete,
    STORAGE_KEYS.theme,
    STORAGE_KEYS.customItems
  ], (result) => {
    checkedItems = result[STORAGE_KEYS.checked] || {};
    templateData = result[STORAGE_KEYS.templates] || {};
    settings = result[STORAGE_KEYS.settings] || { ...DEFAULT_SETTINGS };
    setupComplete = result[STORAGE_KEYS.setupComplete] || false;
    currentTheme = result[STORAGE_KEYS.theme] || settings.theme || "dark";
    customItems = result[STORAGE_KEYS.customItems] || {};
    applyTheme(currentTheme);
    render();
  });

  // === HELPERS ===
  function itemKey(catId, fi, ii) { return `${catId}-${fi}-${ii}`; }
  function templateKey(catId, fi, ii) { return `tpl-${catId}-${fi}-${ii}`; }
  function customItemKey(catId, fi, itemId) { return `custom-${catId}-${fi}-${itemId}`; }
  function customTemplateKey(catId, fi, itemId) { return `tpl-custom-${catId}-${fi}-${itemId}`; }
  function folderKey(catId, fi) { return `${catId}-${fi}`; }

  // Get custom items for a folder
  function getCustomItemsForFolder(catId, fi) {
    const key = folderKey(catId, fi);
    return customItems[key] || [];
  }

  // Generate unique ID for custom items
  function generateCustomItemId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }

  // Replace placeholders in text with actual settings values
  function replacePlaceholders(text) {
    if (!text) return text;
    let result = text
      .replace(/\{familyName\}/g, settings.familyName)
      .replace(/\{primaryUser\}/g, settings.primaryUserName)
      .replace(/\{partner\}/g, settings.partnerName);

    // Handle children references
    if (settings.children && settings.children.length > 0) {
      result = result.replace(/\{firstChild\}/g, settings.children[0] || 'Child');
      result = result.replace(/\{children\}/g, settings.children.join(', '));
    } else {
      result = result.replace(/\{firstChild\}/g, 'Child');
      result = result.replace(/\{children\}/g, 'Children');
    }

    return result;
  }

  // Process CATEGORIES to add dynamic items based on settings (children, bank accounts)
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
    const children = settings.children || ['Child'];
    const bankAccounts = settings.bankAccounts || [];

    return CATEGORIES.map(cat => {
      const newFolders = cat.folders.map(folder => {
        let newItems = [];

        folder.items.forEach(item => {
          // Check if this is a child-specific item that should be expanded for all children
          if (item.text.includes('{firstChild}') && children.length > 1) {
            // Create an item for each child
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
          } else {
            newItems.push(item);
          }
        });

        // Add bank account items for checking/savings folders
        if (folder.name === 'Checking Accounts' && bankAccounts.length > 0) {
          const checkingAccounts = bankAccounts.filter(b => b.type === 'checking');
          checkingAccounts.forEach(account => {
            // Check if this account item already exists
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

        // Add investment account items for brokerage folder
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

        // Add credit card items for credit cards folder
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
      // Include custom items
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
        // Include custom items
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
        // Include custom items
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

  function escAttr(s) {
    return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // === RENDER SETUP WIZARD ===
  function renderSetupWizard() {
    const steps = [
      {
        title: "Welcome to Family Life Vault",
        subtitle: "Let's set up your personal vault in just a few steps",
        fields: []
      },
      {
        title: "Family Information",
        subtitle: "What should we call your family?",
        fields: [
          { id: "familyName", label: "Family Name", placeholder: "e.g., Smith Family", hint: "This will appear as the title of your vault" },
          { id: "primaryUserName", label: "Primary User Name", placeholder: "e.g., John", hint: "The main person organizing this vault" }
        ]
      },
      {
        title: "Partner Information",
        subtitle: "Who is your partner or next of kin?",
        fields: [
          { id: "partnerName", label: "Partner's Name", placeholder: "e.g., Jane", hint: "Your spouse, partner, or primary beneficiary" }
        ]
      },
      {
        title: "Children",
        subtitle: "Add your children (you can add more later)",
        type: "children"
      },
      {
        title: "You're All Set!",
        subtitle: "You can always update these settings later",
        type: "complete"
      }
    ];

    const step = steps[currentSetupStep];
    let html = `<div class="setup-wizard">
      <div class="setup-card">
        <div class="setup-logo">\uD83D\uDEE1\uFE0F</div>
        <div class="setup-progress">`;

    steps.forEach((_, i) => {
      const stateClass = i < currentSetupStep ? 'completed' : i === currentSetupStep ? 'active' : '';
      html += `<div class="setup-dot ${stateClass}"></div>`;
    });

    html += `</div>
        <h1 class="setup-title">${step.title}</h1>
        <p class="setup-subtitle">${step.subtitle}</p>`;

    if (step.fields && step.fields.length > 0) {
      step.fields.forEach(field => {
        const value = settings[field.id] || '';
        html += `<div class="setup-field">
          <label class="setup-label">${field.label}</label>
          <input class="setup-input" type="text" id="setup-${field.id}" value="${escAttr(value)}" placeholder="${field.placeholder}">
          ${field.hint ? `<div class="setup-hint">${field.hint}</div>` : ''}
        </div>`;
      });
    }

    if (step.type === 'children') {
      html += `<div class="setup-field">
        <label class="setup-label">Children's Names</label>
        <div class="children-list" id="setup-children-list">`;

      (settings.children || ['']).forEach((child, i) => {
        html += `<div class="child-item">
          <input class="setup-input" type="text" data-child-index="${i}" value="${escAttr(child)}" placeholder="Child's name">
          ${settings.children.length > 1 ? `<button class="child-remove" data-action="remove-child" data-child-index="${i}">&times;</button>` : ''}
        </div>`;
      });

      html += `</div>
        <button class="add-child-btn" data-action="add-child">+ Add Another Child</button>
        <div class="setup-hint">You can add more children or remove them later in settings</div>
      </div>`;
    }

    if (step.type === 'complete') {
      html += `<div style="background:rgba(52,211,153,0.1);border:1px solid rgba(52,211,153,0.3);border-radius:12px;padding:20px;margin:20px 0">
        <div style="color:#6EE7B7;font-weight:700;margin-bottom:8px">\u2713 Setup Summary</div>
        <div style="color:#CBD5E1;font-size:13px;line-height:1.6">
          <strong>Family:</strong> ${escAttr(settings.familyName)}<br>
          <strong>Primary User:</strong> ${escAttr(settings.primaryUserName)}<br>
          <strong>Partner:</strong> ${escAttr(settings.partnerName)}<br>
          <strong>Children:</strong> ${settings.children.filter(c => c).join(', ') || 'None'}
        </div>
      </div>`;
    }

    html += `<div class="setup-nav">`;

    if (currentSetupStep > 0) {
      html += `<button class="setup-btn secondary" data-action="setup-prev">Back</button>`;
    }

    if (currentSetupStep === steps.length - 1) {
      html += `<button class="setup-btn" data-action="setup-complete">Start Using Life Vault</button>`;
    } else if (currentSetupStep === 0) {
      html += `<button class="setup-btn" data-action="setup-next">Get Started</button>`;
    } else {
      html += `<button class="setup-btn" data-action="setup-next">Continue</button>`;
    }

    html += `</div></div></div>`;

    return html;
  }

  // === RENDER SETTINGS MODAL ===
  function renderSettingsModal() {
    let html = `<div class="modal-overlay" data-action="close-modal-overlay">
      <div class="modal settings-modal" data-modal-inner="true" style="max-width:700px">
        <div class="modal-header">
          <div class="modal-title">\u2699\uFE0F Settings</div>
          <button class="modal-close" data-action="close-settings">&times;</button>
        </div>
        <div class="modal-body">

          <div class="tpl-section">
            <div class="tpl-section-title">Family Information</div>
            <div class="tpl-field">
              <label class="tpl-label">Family Name</label>
              <input class="tpl-input" id="settings-familyName" type="text" value="${escAttr(settings.familyName)}" placeholder="e.g., Smith Family">
            </div>
            <div class="tpl-field">
              <label class="tpl-label">Primary User Name</label>
              <input class="tpl-input" id="settings-primaryUserName" type="text" value="${escAttr(settings.primaryUserName)}" placeholder="e.g., John">
              <div class="tpl-hint">This is you - the main person organizing the vault</div>
            </div>
            <div class="tpl-field">
              <label class="tpl-label">Partner's Name</label>
              <input class="tpl-input" id="settings-partnerName" type="text" value="${escAttr(settings.partnerName)}" placeholder="e.g., Jane">
              <div class="tpl-hint">Your spouse, partner, or primary beneficiary</div>
            </div>
          </div>

          <div class="tpl-section">
            <div class="tpl-section-title">Children</div>
            <div class="children-list" id="settings-children-list">`;

    (settings.children || []).forEach((child, i) => {
      html += `<div class="child-item">
        <input class="tpl-input" type="text" data-settings-child-index="${i}" value="${escAttr(child)}" placeholder="Child's name">
        ${settings.children.length > 1 ? `<button class="child-remove" data-action="settings-remove-child" data-child-index="${i}">&times;</button>` : ''}
      </div>`;
    });

    html += `</div>
            <button class="add-child-btn" data-action="settings-add-child">+ Add Another Child</button>
          </div>

          <div class="tpl-section">
            <div class="tpl-section-title">Bank Accounts</div>
            <div class="tpl-hint" style="margin-bottom:12px">Customize the bank account names used throughout the vault</div>
            <div class="bank-list" id="settings-bank-list">`;

    (settings.bankAccounts || []).forEach((bank, i) => {
      html += `<div class="bank-item">
        <input class="tpl-input" type="text" data-settings-bank-index="${i}" data-field="name" value="${escAttr(bank.name)}" placeholder="Account name">
        <select class="tpl-input" style="width:150px" data-settings-bank-index="${i}" data-field="type">
          <option value="checking" ${bank.type === 'checking' ? 'selected' : ''}>Checking</option>
          <option value="savings" ${bank.type === 'savings' ? 'selected' : ''}>Savings</option>
          <option value="hys" ${bank.type === 'hys' ? 'selected' : ''}>High-Yield Savings</option>
          <option value="foreign" ${bank.type === 'foreign' ? 'selected' : ''}>Foreign Account</option>
          <option value="credit" ${bank.type === 'credit' ? 'selected' : ''}>Credit Card</option>
          <option value="investment" ${bank.type === 'investment' ? 'selected' : ''}>Investment</option>
        </select>
        <button class="remove-item-btn" data-action="settings-remove-bank" data-bank-index="${i}">&times;</button>
      </div>`;
    });

    html += `</div>
            <button class="add-item-btn" data-action="settings-add-bank">+ Add Bank Account</button>
          </div>

          <div class="tpl-section">
            <div class="tpl-section-title">Quick Links</div>
            <div class="tpl-hint" style="margin-bottom:12px">Add links to important documents (Notion pages, Google Drive folders, etc.)</div>
            <div class="link-list" id="settings-link-list">`;

    (settings.quickLinks || []).forEach((link, i) => {
      html += `<div class="link-item">
        <input class="tpl-input" type="text" data-settings-link-index="${i}" data-field="label" value="${escAttr(link.label)}" placeholder="Link label">
        <input class="tpl-input" type="text" data-settings-link-index="${i}" data-field="url" value="${escAttr(link.url)}" placeholder="URL">
        <button class="remove-item-btn" data-action="settings-remove-link" data-link-index="${i}">&times;</button>
      </div>`;
    });

    html += `</div>
            <button class="add-item-btn" data-action="settings-add-link">+ Add Quick Link</button>
          </div>

          <div class="tpl-section">
            <div class="tpl-section-title">Appearance</div>
            <div class="theme-section">
              <div class="tpl-hint" style="margin-bottom:12px">Choose your preferred theme for the Life Vault interface</div>
              <div class="theme-options">
                <div class="theme-option${currentTheme === 'dark' ? ' active' : ''}" data-action="set-theme" data-theme="dark">
                  <div class="theme-option-icon">\uD83C\uDF19</div>
                  <div class="theme-option-label">Dark Mode</div>
                  <div class="theme-option-desc">Easy on the eyes</div>
                </div>
                <div class="theme-option${currentTheme === 'light' ? ' active' : ''}" data-action="set-theme" data-theme="light">
                  <div class="theme-option-icon">\u2600\uFE0F</div>
                  <div class="theme-option-label">Light Mode</div>
                  <div class="theme-option-desc">Bright & clear</div>
                </div>
              </div>
            </div>
          </div>

          <div class="tpl-section">
            <div class="tpl-section-title">Data Management</div>
            <div style="display:flex;gap:8px;flex-wrap:wrap">
              <button class="export-btn" data-action="export-all">Export All Data</button>
              <button class="export-btn" data-action="import-data" style="background:rgba(99,102,241,0.15);border-color:rgba(99,102,241,0.3);color:#A5B4FC">Import Data</button>
              <input type="file" id="import-file-input" accept=".json" style="display:none">
            </div>
          </div>

          <div style="display:flex;gap:8px;margin-top:24px">
            <button class="save-btn" data-action="save-settings">Save Settings</button>
            <button class="export-btn" data-action="close-settings">Cancel</button>
          </div>
        </div>
      </div>
    </div>`;

    return html;
  }

  // === RENDER HELP MODAL ===
  function renderHelpModal() {
    const sections = [
      { id: "overview", label: "Overview", icon: "\uD83C\uDFE0" },
      { id: "getting-started", label: "Getting Started", icon: "\uD83D\uDE80" },
      { id: "categories", label: "Categories Guide", icon: "\uD83D\uDCC2" },
      { id: "features", label: "Features", icon: "\u2728" },
      { id: "tips", label: "Tips & Best Practices", icon: "\uD83D\uDCA1" },
      { id: "resources", label: "Resources & Guides", icon: "\uD83D\uDCDA" },
      { id: "faq", label: "FAQ", icon: "\u2753" }
    ];

    let html = `<div class="modal-overlay" data-action="close-modal-overlay">
      <div class="modal help-modal" data-modal-inner="true" style="max-width:900px;max-height:85vh">
        <div class="modal-header">
          <div class="modal-title">\u2753 Life Vault Help Guide</div>
          <button class="modal-close" data-action="close-help">&times;</button>
        </div>
        <div class="help-content" style="display:flex;gap:20px;padding:20px;overflow:hidden;height:calc(85vh - 80px)">

          <!-- Sidebar -->
          <div class="help-sidebar" style="width:200px;flex-shrink:0;border-right:1px solid var(--border-subtle);padding-right:16px;overflow-y:auto">
            <input class="tpl-input" type="text" id="help-search-input" placeholder="Search help..." value="${escAttr(helpSearchQuery)}" style="margin-bottom:16px;font-size:13px">
            <div class="help-nav" style="display:flex;flex-direction:column;gap:4px">`;

    sections.forEach(section => {
      const isActive = helpActiveSection === section.id;
      html += `<button class="help-nav-item${isActive ? ' active' : ''}" data-action="help-set-section" data-section="${section.id}" style="display:flex;align-items:center;gap:8px;padding:10px 12px;border:none;background:${isActive ? 'var(--accent-primary)' : 'transparent'};color:${isActive ? 'white' : 'var(--text-secondary)'};border-radius:8px;cursor:pointer;font-size:13px;text-align:left;transition:all 0.2s">
        <span>${section.icon}</span>
        <span>${section.label}</span>
      </button>`;
    });

    html += `</div>
          </div>

          <!-- Main Content -->
          <div class="help-main" style="flex:1;overflow-y:auto;padding-right:8px">`;

    // Render content based on active section
    switch (helpActiveSection) {
      case "overview":
        html += renderHelpOverview();
        break;
      case "getting-started":
        html += renderHelpGettingStarted();
        break;
      case "categories":
        html += renderHelpCategories();
        break;
      case "features":
        html += renderHelpFeatures();
        break;
      case "tips":
        html += renderHelpTips();
        break;
      case "resources":
        html += renderHelpResources();
        break;
      case "faq":
        html += renderHelpFAQ();
        break;
      default:
        html += renderHelpOverview();
    }

    html += `</div>
        </div>
      </div>
    </div>`;

    return html;
  }

  function renderHelpOverview() {
    return `
      <div class="help-section">
        <h2 style="font-size:20px;font-weight:700;color:var(--text-primary);margin-bottom:16px">\uD83D\uDEE1\uFE0F Welcome to Life Vault</h2>
        <p style="color:var(--text-secondary);line-height:1.7;margin-bottom:20px">
          Life Vault is your comprehensive digital legacy organizer. It helps you document, organize, and share critical information that your loved ones would need in case of emergency or if you're unavailable.
        </p>

        <div style="background:var(--bg-glass);border:1px solid var(--border-subtle);border-radius:12px;padding:20px;margin-bottom:20px">
          <h3 style="font-size:16px;font-weight:600;color:var(--accent-primary);margin-bottom:12px">\uD83C\uDFAF What Life Vault Helps You Do</h3>
          <ul style="color:var(--text-secondary);line-height:1.8;padding-left:20px">
            <li>Organize important documents across <strong>${getProcessedCategories().length} categories</strong></li>
            <li>Track your progress with visual indicators</li>
            <li>Store detailed information for each item</li>
            <li>Provide clear instructions for your next of kin</li>
            <li>Export data for backup or sharing</li>
          </ul>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px">
          <div style="background:linear-gradient(135deg,#6366F120,transparent);border:1px solid #6366F130;border-radius:12px;padding:16px;text-align:center">
            <div style="font-size:32px;margin-bottom:8px">\uD83D\uDCC2</div>
            <div style="font-size:24px;font-weight:700;color:#6366F1">${getProcessedCategories().length}</div>
            <div style="font-size:12px;color:var(--text-secondary)">Categories</div>
          </div>
          <div style="background:linear-gradient(135deg,#A78BFA20,transparent);border:1px solid #A78BFA30;border-radius:12px;padding:16px;text-align:center">
            <div style="font-size:32px;margin-bottom:8px">\uD83D\uDCC1</div>
            <div style="font-size:24px;font-weight:700;color:#A78BFA">${getStats().folders}</div>
            <div style="font-size:12px;color:var(--text-secondary)">Folders</div>
          </div>
          <div style="background:linear-gradient(135deg,#F472B620,transparent);border:1px solid #F472B630;border-radius:12px;padding:16px;text-align:center">
            <div style="font-size:32px;margin-bottom:8px">\u2705</div>
            <div style="font-size:24px;font-weight:700;color:#F472B6">${getStats().total}</div>
            <div style="font-size:12px;color:var(--text-secondary)">Items to Complete</div>
          </div>
        </div>
      </div>`;
  }

  function renderHelpGettingStarted() {
    return `
      <div class="help-section">
        <h2 style="font-size:20px;font-weight:700;color:var(--text-primary);margin-bottom:16px">\uD83D\uDE80 Getting Started</h2>

        <div style="display:flex;flex-direction:column;gap:16px">
          <div style="display:flex;gap:16px;align-items:flex-start;background:var(--bg-glass);border:1px solid var(--border-subtle);border-radius:12px;padding:16px">
            <div style="width:40px;height:40px;border-radius:50%;background:#6366F1;color:white;display:flex;align-items:center;justify-content:center;font-weight:700;flex-shrink:0">1</div>
            <div>
              <h4 style="font-size:15px;font-weight:600;color:var(--text-primary);margin-bottom:4px">Choose a Category</h4>
              <p style="font-size:13px;color:var(--text-secondary);line-height:1.6">Click on any category in the sidebar to view its folders and items. Each category covers a different aspect of your digital legacy.</p>
            </div>
          </div>

          <div style="display:flex;gap:16px;align-items:flex-start;background:var(--bg-glass);border:1px solid var(--border-subtle);border-radius:12px;padding:16px">
            <div style="width:40px;height:40px;border-radius:50%;background:#A78BFA;color:white;display:flex;align-items:center;justify-content:center;font-weight:700;flex-shrink:0">2</div>
            <div>
              <h4 style="font-size:15px;font-weight:600;color:var(--text-primary);margin-bottom:4px">Open Folders</h4>
              <p style="font-size:13px;color:var(--text-secondary);line-height:1.6">Click on a folder to expand it and see all the items. Each folder contains related documents or tasks.</p>
            </div>
          </div>

          <div style="display:flex;gap:16px;align-items:flex-start;background:var(--bg-glass);border:1px solid var(--border-subtle);border-radius:12px;padding:16px">
            <div style="width:40px;height:40px;border-radius:50%;background:#F472B6;color:white;display:flex;align-items:center;justify-content:center;font-weight:700;flex-shrink:0">3</div>
            <div>
              <h4 style="font-size:15px;font-weight:600;color:var(--text-primary);margin-bottom:4px">Fill in Details</h4>
              <p style="font-size:13px;color:var(--text-secondary);line-height:1.6">Click "+ Details" on any item to open a form where you can add specific information like account numbers, locations, or instructions.</p>
            </div>
          </div>

          <div style="display:flex;gap:16px;align-items:flex-start;background:var(--bg-glass);border:1px solid var(--border-subtle);border-radius:12px;padding:16px">
            <div style="width:40px;height:40px;border-radius:50%;background:#34D399;color:white;display:flex;align-items:center;justify-content:center;font-weight:700;flex-shrink:0">4</div>
            <div>
              <h4 style="font-size:15px;font-weight:600;color:var(--text-primary);margin-bottom:4px">Mark as Complete</h4>
              <p style="font-size:13px;color:var(--text-secondary);line-height:1.6">Check off items as you complete them. Your progress is saved automatically and shown in the progress rings.</p>
            </div>
          </div>
        </div>
      </div>`;
  }

  function renderHelpCategories() {
    const cats = getProcessedCategories();
    const searchLower = helpSearchQuery.toLowerCase();

    return `
      <div class="help-section">
        <h2 style="font-size:20px;font-weight:700;color:var(--text-primary);margin-bottom:16px">\uD83D\uDCC2 Categories Guide</h2>
        <p style="color:var(--text-secondary);line-height:1.6;margin-bottom:20px">
          Life Vault organizes your information into ${cats.length} categories. Click on any category below to learn more about what it covers.
        </p>

        <div style="display:flex;flex-direction:column;gap:12px">
          ${cats.filter(cat => {
            if (!helpSearchQuery) return true;
            return replacePlaceholders(cat.name).toLowerCase().includes(searchLower) ||
                   replacePlaceholders(cat.description).toLowerCase().includes(searchLower);
          }).map(cat => {
            const isExpanded = helpExpandedCategories[cat.id];
            const prog = getCatProgress(cat);
            return `
              <div id="help-cat-${cat.id}" style="background:var(--bg-glass);border:1px solid ${cat.color}30;border-radius:12px;overflow:hidden">
                <button data-action="help-toggle-category" data-cat-id="${cat.id}" style="width:100%;display:flex;align-items:center;gap:12px;padding:16px;border:none;background:transparent;cursor:pointer;text-align:left">
                  <div style="width:44px;height:44px;border-radius:10px;background:${cat.color}20;display:flex;align-items:center;justify-content:center;font-size:22px">${cat.icon}</div>
                  <div style="flex:1">
                    <div style="font-size:15px;font-weight:600;color:var(--text-primary)">${escAttr(replacePlaceholders(cat.name))}</div>
                    <div style="font-size:12px;color:var(--text-secondary)">${cat.folders.length} folders &bull; ${Math.round(prog)}% complete</div>
                  </div>
                  <span style="color:var(--text-secondary);font-size:16px">${isExpanded ? '\u25B2' : '\u25BC'}</span>
                </button>
                ${isExpanded ? `
                  <div style="padding:0 16px 16px 16px;border-top:1px solid var(--border-subtle)">
                    <p style="font-size:13px;color:var(--text-secondary);line-height:1.6;margin:16px 0">${escAttr(replacePlaceholders(cat.description))}</p>
                    <div style="font-size:12px;font-weight:600;color:var(--text-primary);margin-bottom:8px">Folders in this category:</div>
                    <ul style="font-size:13px;color:var(--text-secondary);padding-left:20px;line-height:1.8">
                      ${cat.folders.map(f => `<li>\uD83D\uDCC1 ${escAttr(replacePlaceholders(f.name))} (${f.items.length} items)</li>`).join('')}
                    </ul>
                  </div>
                ` : ''}
              </div>`;
          }).join('')}
        </div>
      </div>`;
  }

  function renderHelpFeatures() {
    return `
      <div class="help-section">
        <h2 style="font-size:20px;font-weight:700;color:var(--text-primary);margin-bottom:16px">\u2728 Features</h2>

        <div style="display:grid;gap:16px">
          <div style="background:var(--bg-glass);border:1px solid var(--border-subtle);border-radius:12px;padding:20px">
            <h4 style="font-size:15px;font-weight:600;color:var(--accent-primary);margin-bottom:8px">\uD83D\uDCCA Progress Tracking</h4>
            <p style="font-size:13px;color:var(--text-secondary);line-height:1.6">Visual progress rings show your completion status at a glance. Track progress by category, folder, or overall.</p>
          </div>

          <div style="background:var(--bg-glass);border:1px solid var(--border-subtle);border-radius:12px;padding:20px">
            <h4 style="font-size:15px;font-weight:600;color:#EF4444;margin-bottom:8px">\uD83D\uDEA8 Priority Levels</h4>
            <p style="font-size:13px;color:var(--text-secondary);line-height:1.6">Items are color-coded by priority: <span style="color:#EF4444;font-weight:600">CRITICAL</span>, <span style="color:#FBBF24;font-weight:600">IMPORTANT</span>, and <span style="color:#3B82F6;font-weight:600">OPTIONAL</span>. Use the filter to focus on what matters most.</p>
          </div>

          <div style="background:var(--bg-glass);border:1px solid var(--border-subtle);border-radius:12px;padding:20px">
            <h4 style="font-size:15px;font-weight:600;color:#A78BFA;margin-bottom:8px">\u2795 Custom Items</h4>
            <p style="font-size:13px;color:var(--text-secondary);line-height:1.6">Add your own items to any folder using the "+ Add Custom Item" button. Set your own priority and fill in details just like built-in items.</p>
          </div>

          <div style="background:var(--bg-glass);border:1px solid var(--border-subtle);border-radius:12px;padding:20px">
            <h4 style="font-size:15px;font-weight:600;color:#F472B6;margin-bottom:8px">\uD83D\uDC65 Next of Kin Instructions</h4>
            <p style="font-size:13px;color:var(--text-secondary);line-height:1.6">Each folder includes special instructions for ${escAttr(settings.partnerName)}. Click the "Instructions for Next of Kin" button to view or share these.</p>
          </div>

          <div style="background:var(--bg-glass);border:1px solid var(--border-subtle);border-radius:12px;padding:20px">
            <h4 style="font-size:15px;font-weight:600;color:#34D399;margin-bottom:8px">\uD83D\uDCE4 Export Options</h4>
            <p style="font-size:13px;color:var(--text-secondary);line-height:1.6">Export individual items as Markdown or PDF, or export all your data as JSON for backup. Find export options in Settings.</p>
          </div>

          <div style="background:var(--bg-glass);border:1px solid var(--border-subtle);border-radius:12px;padding:20px">
            <h4 style="font-size:15px;font-weight:600;color:#FBBF24;margin-bottom:8px">\uD83C\uDF19 Theme Options</h4>
            <p style="font-size:13px;color:var(--text-secondary);line-height:1.6">Switch between dark and light mode using the theme toggle in the header or in Settings.</p>
          </div>
        </div>
      </div>`;
  }

  function renderHelpTips() {
    return `
      <div class="help-section">
        <h2 style="font-size:20px;font-weight:700;color:var(--text-primary);margin-bottom:16px">\uD83D\uDCA1 Tips & Best Practices</h2>

        <div style="display:flex;flex-direction:column;gap:16px">
          <div style="background:linear-gradient(135deg,#34D39920,transparent);border:1px solid #34D39940;border-radius:12px;padding:20px">
            <h4 style="font-size:15px;font-weight:600;color:#34D399;margin-bottom:8px">\u2705 Start with Critical Items</h4>
            <p style="font-size:13px;color:var(--text-secondary);line-height:1.6">Use the "critical" filter to focus on the most important items first. These are things your family would need immediate access to.</p>
          </div>

          <div style="background:linear-gradient(135deg,#6366F120,transparent);border:1px solid #6366F140;border-radius:12px;padding:20px">
            <h4 style="font-size:15px;font-weight:600;color:#6366F1;margin-bottom:8px">\uD83D\uDCDD Be Specific in Details</h4>
            <p style="font-size:13px;color:var(--text-secondary);line-height:1.6">When filling in item details, include specific information like account numbers, locations, contact information, and step-by-step instructions.</p>
          </div>

          <div style="background:linear-gradient(135deg,#F472B620,transparent);border:1px solid #F472B640;border-radius:12px;padding:20px">
            <h4 style="font-size:15px;font-weight:600;color:#F472B6;margin-bottom:8px">\uD83D\uDCE6 Regular Backups</h4>
            <p style="font-size:13px;color:var(--text-secondary);line-height:1.6">Export your data regularly from Settings. Store the backup in a secure location that ${escAttr(settings.partnerName)} can access.</p>
          </div>

          <div style="background:linear-gradient(135deg,#FBBF2420,transparent);border:1px solid #FBBF2440;border-radius:12px;padding:20px">
            <h4 style="font-size:15px;font-weight:600;color:#FBBF24;margin-bottom:8px">\uD83D\uDD04 Keep It Updated</h4>
            <p style="font-size:13px;color:var(--text-secondary);line-height:1.6">Review and update your vault periodically, especially after major life changes like moving, changing jobs, or opening new accounts.</p>
          </div>

          <div style="background:linear-gradient(135deg,#A78BFA20,transparent);border:1px solid #A78BFA40;border-radius:12px;padding:20px">
            <h4 style="font-size:15px;font-weight:600;color:#A78BFA;margin-bottom:8px">\uD83D\uDD17 Use Quick Links</h4>
            <p style="font-size:13px;color:var(--text-secondary);line-height:1.6">Add frequently used resources like Google Drive folders or Notion pages to Quick Links in Settings for easy access.</p>
          </div>
        </div>
      </div>`;
  }

  // === HELP RESOURCES DATA ===
  const HELP_RESOURCES = [
    {
      id: "identity",
      title: "Identity & Personal Documents",
      icon: "\uD83E\uDEAA",
      color: "#6366F1",
      context: "Your vault highlights the critical need for original and certified copies of birth certificates and passports.",
      resources: [
        { type: "video", title: "How to Organize Critical Documents", desc: "A quick visual guide on using a system like the Nokbox to separate daily vs. safe-storage documents.", searchQuery: "How to Organize Critical Documents Nokbox" },
        { type: "article", title: "How to Order Vital Records Online", desc: "Use this to order extra certified copies mentioned in your Birth Certificates folder without visiting a government office.", url: "https://www.vitalchek.com" },
        { type: "article", title: "Replace or Renew a Passport (US State Dept)", desc: "Critical for the 'Check expiry' item in your Passports folder.", url: "https://travel.state.gov/content/travel/en/passports.html" }
      ]
    },
    {
      id: "legal",
      title: "Legal & Estate Planning",
      icon: "\u2696\uFE0F",
      color: "#A78BFA",
      context: "Your vault distinguishes between a Will (probate) and a Trust (avoids probate).",
      resources: [
        { type: "video", title: "Estate Planning Made Simple \u2014 Free Starter Kit", desc: "Explains the core difference between a Will and a Trust, helping you decide if you need the Living Trust folder populated.", searchQuery: "Estate Planning Made Simple free starter kit walkthrough" },
        { type: "article", title: "Revocable Trust vs. Will: A Guide", desc: "Understand why your vault prioritizes transferring real property into the trust to avoid probate courts.", url: "https://www.investopedia.com/articles/personal-finance/100715/revocable-trust-vs-will.asp" },
        { type: "article", title: "Power of Attorney vs. Healthcare Proxy", desc: "Clarifies the two distinct POAs listed in your Power of Attorney folder.", url: "https://www.investopedia.com/terms/p/powerofattorney.asp" }
      ]
    },
    {
      id: "financial",
      title: "Financial Accounts",
      icon: "\uD83C\uDFE6",
      color: "#34D399",
      context: "The Beneficiary Designations Master List is identified as a critical failure point in your data.",
      resources: [
        { type: "video", title: "How to Organize Your Financial Life", desc: "Covers consolidating accounts to make the Checking Accounts folder manageable for your executor.", searchQuery: "How to Organize Your Financial Life" },
        { type: "article", title: "Why Beneficiary Designations Override Your Will", desc: "Essential reading for your Beneficiary Master List folder. Explains why a will doesn't control your 401(k) or life insurance.", url: "https://www.investopedia.com/articles/retirement/03/080603.asp" }
      ]
    },
    {
      id: "insurance",
      title: "Insurance",
      icon: "\uD83D\uDEE1\uFE0F",
      color: "#F472B6",
      context: "Your vault notes the specific 60-day deadline for COBRA and the need to file claims.",
      resources: [
        { type: "article", title: "How to Claim Life Insurance Benefits: 6 Steps", desc: "Print this for the Life Insurance folder. It details the exact documents (death certificate, policy bond) needed.", url: "https://www.investopedia.com/articles/personal-finance/061615/how-to-file-life-insurance-claim.asp" },
        { type: "article", title: "COBRA Continuation Coverage Guide (Dept of Labor)", desc: "Critical for the Health Insurance folder. Explains the strict timeline for a surviving spouse to keep health coverage.", url: "https://www.dol.gov/general/topic/health-plans/cobra" }
      ]
    },
    {
      id: "property",
      title: "Property & Assets",
      icon: "\uD83C\uDFE0",
      color: "#FBBF24",
      context: "You have a specific folder for Gold & Valuables and Home Deed.",
      resources: [
        { type: "video", title: "Create a Home Inventory for Insurance", desc: "Shows how to video-log your Gold, Jewelry & Valuables folder items for insurance claims.", searchQuery: "Create Home Inventory for Insurance" },
        { type: "article", title: "How to Create a Home Inventory", desc: "Use the spreadsheet method mentioned here to fill out your Primary Home folder details.", url: "https://www.iii.org/article/how-create-home-inventory" }
      ]
    },
    {
      id: "taxes",
      title: "Taxes",
      icon: "\uD83D\uDCB0",
      color: "#EF4444",
      context: "Your vault flags the final tax return as a critical task for the executor.",
      resources: [
        { type: "article", title: "Filing a Final Federal Tax Return for a Deceased Person (IRS)", desc: "The definitive guide for the US Tax Records folder. Covers who signs the return and how to claim refunds.", url: "https://www.irs.gov/individuals/file-the-final-income-tax-returns-of-a-deceased-person" },
        { type: "article", title: "TurboTax Guide: Death in the Family", desc: "A more user-friendly explanation of Income in Respect of a Decedent mentioned in your International Tax Records folder.", url: "https://turbotax.intuit.com/tax-tips/family/death-in-the-family/L5FyFBxyV" }
      ]
    },
    {
      id: "digital",
      title: "Digital Life",
      icon: "\uD83D\uDCBB",
      color: "#3B82F6",
      context: "Your data emphasizes the Password Manager as the key to everything.",
      resources: [
        { type: "video", title: "1Password vs Bitwarden for Families", desc: "Helps you choose the tool for your Device Access folder. Focuses on the Emergency Access features mentioned in your checklist.", searchQuery: "1Password vs Bitwarden for Families" },
        { type: "article", title: "Digital Estate Planning: How to Organize Your Digital Assets", desc: "Step-by-step on naming a Digital Executor for your Social Media folder.", url: "https://www.investopedia.com/terms/d/digital-estate-planning.asp" }
      ]
    },
    {
      id: "health",
      title: "Medical & Health",
      icon: "\uD83C\uDFE5",
      color: "#10B981",
      context: "Organizing Family Doctor Lists and Vaccination Records.",
      resources: [
        { type: "video", title: "Organizing Medical Records for Caregivers", desc: "Practical tips on creating the Medical History Summary for the Medical History folder.", searchQuery: "Organizing Medical Records for Caregivers" },
        { type: "article", title: "Organizing Important Documents for Seniors", desc: "Good checklist for what to put in the Family Doctor folder, specifically regarding HIPAA Release Forms.", url: "https://www.aarp.org/caregiving/basics/info-2020/important-documents.html" }
      ]
    },
    {
      id: "children",
      title: "Family & Childcare",
      icon: "\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67\u200D\uD83D\uDC66",
      color: "#EC4899",
      context: "The Education Planning folder mentions 529 Successor Owners, a technical but critical detail.",
      resources: [
        { type: "article", title: "What Happens When a 529 Account Owner Dies?", desc: "Explains exactly how to assign the Successor Owner mentioned in your Education Savings folder so the account doesn't freeze.", url: "https://www.savingforcollege.com/article/what-happens-to-your-529-plan-if-you-die" },
        { type: "article", title: "Letter of Instruction for Guardians", desc: "Use this to write the Letter of wishes in your Guardianship folder.", url: "https://www.nolo.com/legal-encyclopedia/writing-letter-instruction-will.html" }
      ]
    },
    {
      id: "work",
      title: "Employment & Income",
      icon: "\uD83D\uDCBC",
      color: "#8B5CF6",
      context: "Your vault lists RSU vesting and Employer death benefits as key items.",
      resources: [
        { type: "article", title: "What Happens to RSUs and Stock Options When You Die?", desc: "Critical reading for the Employer Stock & RSUs folder. Explains why unvested RSUs might be lost and how to check your plan document.", url: "https://www.investopedia.com/articles/personal-finance/082015/what-happens-restricted-stock-units-after-you-leave-company.asp" },
        { type: "article", title: "Checklist: When an Employee Dies", desc: "Shows you what the employer's HR side looks like, helping your Current Employment folder instructions be more precise.", url: "https://www.shrm.org/topics-tools/news/hr-magazine/death-employee" }
      ]
    },
    {
      id: "debts",
      title: "Debts & Obligations",
      icon: "\uD83D\uDCB3",
      color: "#F59E0B",
      context: "The instruction that a mortgage does NOT need to be paid off is a specific legal protection.",
      resources: [
        { type: "article", title: "What Happens to Debt When You Die?", desc: "Validate the instructions in your Other Loans folder. Confirms that family members usually don't inherit debt unless they co-signed.", url: "https://www.nerdwallet.com/article/finance/what-happens-to-debt-when-you-die" }
      ]
    },
    {
      id: "home",
      title: "Home & Utilities",
      icon: "\uD83C\uDFE1",
      color: "#06B6D4",
      context: "Managing Keys & Access Codes and Auto-pay.",
      resources: [
        { type: "article", title: "The Ultimate Moving & Utilities Checklist", desc: "While written for moving, this is the best type of list to populate your Utilities & Services folder with account numbers and providers.", url: "https://www.moving.com/tips/moving-utilities-checklist/" }
      ]
    },
    {
      id: "emergency",
      title: "Emergency Contacts",
      icon: "\uD83D\uDCDE",
      color: "#EF4444",
      context: "The First 48 Hours calls are critical.",
      resources: [
        { type: "article", title: "The ICE (In Case of Emergency) Binder Checklist", desc: "Use this to verify you haven't missed anyone in your Emergency Contacts folder.", url: "https://www.theorganizedmom.net/ice-binder-checklist/" }
      ]
    },
    {
      id: "after-death",
      title: "After Death Playbook",
      icon: "\uD83D\uDCD6",
      color: "#DC2626",
      context: "The First 48 Hours and First 30 Days checklists are your vault's action section.",
      resources: [
        { type: "article", title: "What to Do in the First 48 Hours After a Death", desc: "Print this and place it at the very front of the First 48 Hours Checklist folder. It covers immediate steps like securing the home.", url: "https://www.joincake.com/blog/what-to-do-when-someone-dies/" },
        { type: "article", title: "After a Death Occurs \u2014 A Checklist", desc: "A concise PDF checklist that mirrors your First 30 Days Action Plan folder perfectly.", url: "https://www.aarp.org/home-family/friends-family/info-2020/when-loved-one-dies-702.html" }
      ]
    },
    {
      id: "wishes",
      title: "Legacy & Memories",
      icon: "\uD83D\uDC9C",
      color: "#A855F7",
      context: "Ethical Will and Legacy Letters are unique items in your vault.",
      resources: [
        { type: "video", title: "Writing a Legacy Letter", desc: "Visual guidance on writing an ethical will or legacy letter for your loved ones.", searchQuery: "Writing a Legacy Letter Ethical Will" },
        { type: "article", title: "How to Write an Ethical Will", desc: "Provides prompts and examples to help you write the Letter of values mentioned in your Ethical Will folder.", url: "https://www.investopedia.com/terms/e/ethical-will.asp" }
      ]
    }
  ];

  function renderHelpResources() {
    const searchLower = helpResourceSearchQuery.toLowerCase();
    const filteredResources = HELP_RESOURCES.filter(cat => {
      if (!helpResourceSearchQuery) return true;
      return cat.title.toLowerCase().includes(searchLower) ||
             cat.context.toLowerCase().includes(searchLower) ||
             cat.resources.some(r => r.title.toLowerCase().includes(searchLower) || r.desc.toLowerCase().includes(searchLower));
    });

    return `
      <div class="help-section">
        <h2 style="font-size:20px;font-weight:700;color:var(--text-primary);margin-bottom:8px">\uD83D\uDCDA Resources & Guides</h2>
        <p style="color:var(--text-secondary);line-height:1.6;margin-bottom:16px">
          Curated videos and articles to help you complete each vault category. Expand a category to see relevant guides, then click to watch or read.
        </p>

        <input class="tpl-input" type="text" id="resource-search-input" placeholder="Search resources..." value="${escAttr(helpResourceSearchQuery)}" style="margin-bottom:20px;font-size:13px">

        <div style="display:flex;flex-direction:column;gap:12px">
          ${filteredResources.map((cat, ci) => {
            const isExpanded = helpExpandedResources[cat.id];
            return `
              <div class="help-resource-category" style="background:var(--bg-glass);border:1px solid ${cat.color}30;border-radius:12px;overflow:hidden">
                <button data-action="help-toggle-resource" data-resource-id="${cat.id}" style="width:100%;display:flex;align-items:center;gap:12px;padding:14px 16px;border:none;background:transparent;cursor:pointer;text-align:left">
                  <div style="width:40px;height:40px;border-radius:10px;background:${cat.color}20;display:flex;align-items:center;justify-content:center;font-size:20px">${cat.icon}</div>
                  <div style="flex:1">
                    <div style="font-size:14px;font-weight:600;color:var(--text-primary)">${escAttr(cat.title)}</div>
                    <div style="font-size:11px;color:var(--text-secondary);margin-top:2px">${cat.resources.length} resource${cat.resources.length !== 1 ? 's' : ''}</div>
                  </div>
                  <span style="color:var(--text-secondary);font-size:14px;transition:transform 0.2s;${isExpanded ? 'transform:rotate(180deg)' : ''}">\u25BC</span>
                </button>
                ${isExpanded ? `
                  <div style="padding:0 16px 16px;border-top:1px solid var(--border-subtle)">
                    <p style="font-size:12px;color:var(--text-secondary);line-height:1.5;margin:12px 0;padding:10px;background:${cat.color}08;border-left:3px solid ${cat.color};border-radius:0 8px 8px 0">
                      <strong style="color:${cat.color}">Context:</strong> ${escAttr(cat.context)}
                    </p>
                    <div style="display:flex;flex-direction:column;gap:10px">
                      ${cat.resources.map((res, ri) => {
                        const videoKey = cat.id + '-' + ri;
                        const isVideoOpen = helpActiveResourceVideo === videoKey;
                        const ytSearchUrl = 'https://www.youtube.com/results?search_query=' + encodeURIComponent(res.searchQuery || res.title);
                        if (res.type === 'video') {
                          return `
                            <div class="help-resource-video-card" style="border:1px solid rgba(239,68,68,0.2);border-radius:10px;overflow:hidden">
                              <button data-action="help-toggle-video" data-video-key="${videoKey}" style="width:100%;display:flex;gap:12px;align-items:center;padding:12px 14px;border:none;background:linear-gradient(135deg,rgba(239,68,68,0.1),rgba(239,68,68,0.05));cursor:pointer;text-align:left">
                                <div style="width:36px;height:36px;border-radius:8px;background:rgba(239,68,68,0.15);display:flex;align-items:center;justify-content:center;flex-shrink:0">
                                  <span style="font-size:18px">${isVideoOpen ? '\u25B2' : '\u25B6\uFE0F'}</span>
                                </div>
                                <div style="flex:1;min-width:0">
                                  <div style="font-size:13px;font-weight:600;color:var(--text-primary)">\uD83C\uDFA5 ${escAttr(res.title)}</div>
                                  <div style="font-size:11px;color:var(--text-secondary);line-height:1.4;margin-top:2px">${escAttr(res.desc)}</div>
                                </div>
                                <span style="font-size:11px;color:#F87171;font-weight:600;white-space:nowrap">${isVideoOpen ? 'Close' : 'Watch'}</span>
                              </button>
                              ${isVideoOpen ? `
                                <div style="padding:0 14px 14px">
                                  <div style="position:relative;border-radius:10px;overflow:hidden;margin-top:10px;background:linear-gradient(135deg,#1a1a2e,#16213e);padding:20px;text-align:center">
                                    <div style="font-size:48px;margin-bottom:12px">\uD83C\uDFA5</div>
                                    <div style="font-size:14px;font-weight:600;color:#F8FAFC;margin-bottom:6px">${escAttr(res.title)}</div>
                                    <div style="font-size:12px;color:#94A3B8;margin-bottom:16px;line-height:1.5">${escAttr(res.desc)}</div>
                                    <a href="${escAttr(ytSearchUrl)}" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:8px;padding:10px 20px;background:#EF4444;color:white;text-decoration:none;border-radius:8px;font-size:13px;font-weight:600;transition:all 0.2s">
                                      \u25B6 Watch on YouTube
                                    </a>
                                  </div>
                                  <div style="display:flex;align-items:center;gap:10px;margin-top:10px;flex-wrap:wrap">
                                    <a href="${escAttr(ytSearchUrl)}" target="_blank" rel="noopener" style="font-size:11px;color:#F87171;text-decoration:none;font-weight:600">\uD83D\uDD0D Search for this video on YouTube \u2197</a>
                                  </div>
                                </div>
                              ` : ''}
                            </div>`;
                        } else {
                          return `
                            <a href="${escAttr(res.url)}" target="_blank" rel="noopener" class="help-resource-article-card" style="display:flex;gap:12px;align-items:flex-start;padding:12px 14px;border:1px solid rgba(52,211,153,0.2);border-radius:10px;background:linear-gradient(135deg,rgba(52,211,153,0.08),rgba(52,211,153,0.03));text-decoration:none;transition:all 0.2s">
                              <div style="width:36px;height:36px;border-radius:8px;background:rgba(52,211,153,0.15);display:flex;align-items:center;justify-content:center;flex-shrink:0">
                                <span style="font-size:18px">\uD83D\uDCDD</span>
                              </div>
                              <div style="flex:1;min-width:0">
                                <div style="font-size:13px;font-weight:600;color:var(--text-primary)">\uD83D\uDCD6 ${escAttr(res.title)}</div>
                                <div style="font-size:11px;color:var(--text-secondary);line-height:1.4;margin-top:2px">${escAttr(res.desc)}</div>
                                <div style="font-size:10px;color:#6EE7B7;font-weight:600;margin-top:6px">Read Article \u2197</div>
                              </div>
                            </a>`;
                        }
                      }).join('')}
                    </div>
                  </div>
                ` : ''}
              </div>`;
          }).join('')}
        </div>
        ${filteredResources.length === 0 ? `
          <div style="text-align:center;padding:40px 20px;color:var(--text-secondary)">
            <div style="font-size:32px;margin-bottom:12px">\uD83D\uDD0D</div>
            <p style="font-size:14px">No resources found matching "${escAttr(helpResourceSearchQuery)}"</p>
          </div>
        ` : ''}
      </div>`;
  }

  function renderHelpFAQ() {
    const faqs = [
      {
        q: "Where is my data stored?",
        a: "All your data is stored locally in your browser's Chrome storage. It never leaves your device unless you explicitly export it."
      },
      {
        q: "Can I use Life Vault on multiple devices?",
        a: "Currently, Life Vault stores data locally per browser. To use on another device, export your data and import it on the new device."
      },
      {
        q: "How do I share information with my partner?",
        a: "You can export individual items as PDF or Markdown files, or export all data as JSON. Share these files securely with your partner."
      },
      {
        q: "Can I add my own items to a folder?",
        a: "Yes! Click the '+ Add Custom Item' button at the bottom of any folder to add your own items with custom priorities."
      },
      {
        q: "What happens if I reset my progress?",
        a: "The Reset button only clears your checkmarks. Your filled-in details and custom items are preserved."
      },
      {
        q: "How do I change my family information?",
        a: "Go to Settings (gear icon in the header) to update family names, children, bank accounts, and other personalized information."
      }
    ];

    return `
      <div class="help-section">
        <h2 style="font-size:20px;font-weight:700;color:var(--text-primary);margin-bottom:16px">\u2753 Frequently Asked Questions</h2>

        <div style="display:flex;flex-direction:column;gap:12px">
          ${faqs.map(faq => `
            <div style="background:var(--bg-glass);border:1px solid var(--border-subtle);border-radius:12px;padding:16px">
              <h4 style="font-size:14px;font-weight:600;color:var(--text-primary);margin-bottom:8px">${escAttr(faq.q)}</h4>
              <p style="font-size:13px;color:var(--text-secondary);line-height:1.6">${escAttr(faq.a)}</p>
            </div>
          `).join('')}
        </div>
      </div>`;
  }

  // === RENDER CUSTOM ITEM MODAL ===
  function renderCustomItemModal() {
    const { catId, folderIdx } = customItemModalOpen;
    const cat = getProcessedCategories().find(c => c.id === catId);
    const folder = cat ? cat.folders[folderIdx] : null;

    let html = `<div class="modal-overlay" data-action="close-modal-overlay">
      <div class="modal" data-modal-inner="true" style="max-width:500px">
        <div class="modal-header">
          <div>
            <div class="modal-title">\u2795 Add Custom Item</div>
            <div style="font-size:12px;color:#94A3B8;margin-top:4px">${folder ? escAttr(replacePlaceholders(folder.name)) : ''}</div>
          </div>
          <button class="modal-close" data-action="close-custom-item-modal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="tpl-section">
            <div class="tpl-section-title">Item Details</div>
            <div class="tpl-field">
              <label class="tpl-label">Item Description *</label>
              <input class="tpl-input" id="custom-item-text" type="text" placeholder="Enter a description for this item...">
              <div class="tpl-hint">What needs to be documented or tracked?</div>
            </div>
            <div class="tpl-field">
              <label class="tpl-label">Priority Level *</label>
              <div class="priority-selector">
                <label class="priority-option">
                  <input type="radio" name="custom-item-priority" value="critical">
                  <span class="priority-chip" style="background:${PRIORITY_COLORS.critical.dot}20;color:${PRIORITY_COLORS.critical.dot};border:1px solid ${PRIORITY_COLORS.critical.dot}40">
                    ${PRIORITY_COLORS.critical.label}
                  </span>
                </label>
                <label class="priority-option">
                  <input type="radio" name="custom-item-priority" value="important" checked>
                  <span class="priority-chip" style="background:${PRIORITY_COLORS.important.dot}20;color:${PRIORITY_COLORS.important.dot};border:1px solid ${PRIORITY_COLORS.important.dot}40">
                    ${PRIORITY_COLORS.important.label}
                  </span>
                </label>
                <label class="priority-option">
                  <input type="radio" name="custom-item-priority" value="optional">
                  <span class="priority-chip" style="background:${PRIORITY_COLORS.optional.dot}20;color:${PRIORITY_COLORS.optional.dot};border:1px solid ${PRIORITY_COLORS.optional.dot}40">
                    ${PRIORITY_COLORS.optional.label}
                  </span>
                </label>
              </div>
              <div class="tpl-hint">How urgent is this item?</div>
            </div>
          </div>
          <div style="display:flex;gap:8px;margin-top:20px">
            <button class="save-btn" data-action="save-custom-item">Add Item</button>
            <button class="export-btn" data-action="close-custom-item-modal">Cancel</button>
          </div>
        </div>
      </div>
    </div>`;

    return html;
  }

  // === RENDER ===
  function render() {
    // Show setup wizard if not complete
    if (!setupComplete) {
      document.getElementById("app").innerHTML = renderSetupWizard();
      return;
    }

    const stats = getStats();
    const overallProg = getOverallProgress();
    const activeCat = getProcessedCategories().find(c => c.id === activeCategory);

    let html = '';

    // HEADER
    html += `<div class="header"><div class="header-inner">`;
    html += `<div class="logo-row">
        <div class="logo">\uD83D\uDEE1\uFE0F</div>
        <div><div class="title">${escAttr(settings.familyName)} Life Vault</div>
          <div class="subtitle">Everything ${escAttr(settings.partnerName)} needs, in one place. Built for your family.</div></div>
        <div style="margin-left:auto;display:flex;gap:8px">
          <button class="theme-toggle" data-action="toggle-theme" title="Switch to ${getThemeLabel()}">
            <span class="theme-toggle-icon">${getThemeIcon()}</span>
            <span>${getThemeLabel()}</span>
          </button>
          <button class="settings-btn" data-action="open-help">\u2753 Help</button>
          <button class="settings-btn" data-action="open-settings">\u2699\uFE0F Settings</button>
        </div>
      </div>`;

    // Stats bar
    html += `<div class="stats-bar">`;
    html += progressRingSVG(overallProg, 56, 5, "#6366F1");
    const statItems = [
      { label: "Categories", value: getProcessedCategories().length, color: "#818CF8" },
      { label: "Folders", value: stats.folders, color: "#A78BFA" },
      { label: "Total Items", value: stats.total, color: "#F472B6" },
      { label: "Completed", value: stats.done, color: "#34D399" },
      { label: "Critical Done", value: `${stats.critDone}/${stats.critical}`, color: "#F87171" },
    ];
    html += `<div style="display:flex;gap:16px;flex-wrap:wrap;flex:1">`;
    statItems.forEach(s => {
      html += `<div class="stat"><div class="stat-value" style="color:${s.color}">${s.value}</div><div class="stat-label">${s.label}</div></div>`;
    });
    html += `</div>`;

    html += `<div class="action-bar">
          <button class="reset-btn" data-action="reset-all">Reset</button>
        </div>`;
    html += `</div>`; // stats-bar

    // Filters
    html += `<div class="filters">`;
    html += `<span style="font-size:11px;color:#64748B;font-weight:600;text-transform:uppercase">Filter:</span>`;
    ["all", "critical", "important", "optional"].forEach(f => {
      const active = filter === f;
      const bg = active ? (f === "all" ? "#6366F1" : PRIORITY_COLORS[f]?.dot || "#6366F1") : "";
      html += `<button class="filter-btn${active ? ' active' : ''}" style="${active ? 'background:' + bg : ''}" data-action="set-filter" data-filter="${f}">${f}</button>`;
    });
    html += `<input class="search-input" type="text" placeholder="Search items..." value="${escAttr(searchQuery)}" data-action="search-input" id="search-input">`;
    html += `</div>`;

    html += `</div></div>`; // header-inner, header

    // MAIN
    html += `<div class="main">`;

    // SIDEBAR
    html += `<div class="sidebar"><div class="sidebar-inner">`;
    html += `<div class="sidebar-title">Categories (${getProcessedCategories().length})</div>`;
    getProcessedCategories().forEach(cat => {
      const prog = getCatProgress(cat);
      const isActive = activeCategory === cat.id;
      html += `<button class="cat-btn${isActive ? ' active' : ''}" style="${isActive ? 'background:linear-gradient(90deg,' + cat.color + '20,transparent);border-color:' + cat.color + '40' : ''}" data-action="select-category" data-cat-id="${cat.id}">
        <div class="cat-icon" style="background:${cat.color}20;border:1px solid ${cat.color}30">${cat.icon}</div>
        <div style="flex:1;min-width:0">
          <div class="cat-name" ${isActive ? ' style="color:var(--text-primary)"' : ''}>${escAttr(replacePlaceholders(cat.name))}</div>
          <div class="cat-prog-bar"><div class="cat-prog-fill" style="width:${prog}%;background:${cat.color}"></div></div>
        </div>
        <span class="cat-pct" style="color:${cat.color}">${Math.round(prog)}%</span>
      </button>`;
    });
    html += `</div></div>`;

    // DETAIL PANEL
    html += `<div class="detail">`;

    if (!activeCat) {
      // DASHBOARD
      html += `<div class="welcome-box">
        <h2 style="font-size:18px;font-weight:800;color:var(--text-primary);margin-bottom:8px">Welcome to your Life Vault, ${escAttr(settings.primaryUserName)}</h2>
        <p style="font-size:13px;color:#94A3B8;line-height:1.6">This system ensures ${escAttr(settings.partnerName)} and your family have everything they need if you're not available.
        <strong style="color:#A5B4FC">${getProcessedCategories().length} color-coded categories</strong> and
        <strong style="color:#F9A8D4">${stats.folders} organized folders</strong> with <strong style="color:#6EE7B7">${stats.total} actionable items</strong>.
        Each item has a detail template page to fill in your specific information.</p>`;

      // Quick links if configured
      if (settings.quickLinks && settings.quickLinks.length > 0) {
        html += `<div class="quick-links">`;
        settings.quickLinks.forEach(link => {
          html += `<a href="${escAttr(link.url)}" target="_blank" class="quick-link" style="color:#A5B4FC;border-color:rgba(165,180,252,0.2)">\uD83D\uDD17 ${escAttr(link.label)}</a>`;
        });
        html += `</div>`;
      }
      html += `</div>`;

      html += `<div class="dashboard-grid">`;
      getProcessedCategories().forEach(cat => {
        const prog = getCatProgress(cat);
        // Include custom items in the count
        let totalItems = cat.folders.reduce((a, f) => a + f.items.length, 0);
        let doneItems = cat.folders.reduce((a, f, fi) =>
          a + f.items.filter((_, ii) => checkedItems[itemKey(cat.id, fi, ii)]).length, 0);

        // Add custom items
        cat.folders.forEach((f, fi) => {
          const folderCustomItems = getCustomItemsForFolder(cat.id, fi);
          totalItems += folderCustomItems.length;
          doneItems += folderCustomItems.filter(ci => checkedItems[customItemKey(cat.id, fi, ci.id)]).length;
        });
        html += `<div class="dash-card" data-action="select-category" data-cat-id="${cat.id}" data-hover-color="${cat.color}40">
          ${progressRingSVG(prog, 44, 4, cat.color)}
          <div style="flex:1">
            <div style="font-size:13px;font-weight:700;color:var(--text-primary);margin-bottom:2px">${cat.icon} ${escAttr(replacePlaceholders(cat.name))}</div>
            <div style="font-size:11px;color:#64748B;margin-bottom:6px">${cat.folders.length} folders &middot; ${doneItems}/${totalItems} items</div>
            <div style="font-size:11px;color:#94A3B8;line-height:1.4">${escAttr(replacePlaceholders(cat.description).substring(0, 90))}...</div>
          </div>
        </div>`;
      });
      html += `</div>`;
    } else {
      // CATEGORY DETAIL VIEW
      const prog = getCatProgress(activeCat);
      html += `<div class="cat-header" style="background:linear-gradient(135deg,${activeCat.color}15,transparent);border:1px solid ${activeCat.color}30">
        <div style="display:flex;align-items:center;gap:10px">
          <div style="width:48px;height:48px;border-radius:12px;background:${activeCat.color}25;display:flex;align-items:center;justify-content:center;font-size:24px;border:2px solid ${activeCat.color}40">${activeCat.icon}</div>
          <div style="flex:1">
            <div style="display:flex;align-items:center;gap:8px">
              <h2 style="font-size:18px;font-weight:800;color:var(--text-primary);margin:0">${escAttr(replacePlaceholders(activeCat.name))}</h2>
              <button class="context-help-btn" data-action="open-context-help" data-context-type="category" data-context-id="${activeCat.id}" style="font-size:12px;padding:4px 8px;background:${activeCat.color}20;color:${activeCat.color};border:none;border-radius:6px;cursor:pointer" title="Watch Video Guide">\uD83C\uDFA5 Guide</button>
            </div>
            <p style="font-size:12px;color:#94A3B8;margin:4px 0 0">${escAttr(replacePlaceholders(activeCat.description))}</p>
          </div>
          ${progressRingSVG(prog, 56, 5, activeCat.color)}
        </div>
      </div>`;

      // FOLDERS
      activeCat.folders.forEach((folder, fi) => {
        const isOpen = activeFolder === fi;
        const items = filteredFolderItems(folder);

        // Get custom items for this folder (filtered)
        const folderCustomItems = getCustomItemsForFolder(activeCat.id, fi).filter(ci => {
          if (filter !== "all" && ci.priority !== filter) return false;
          if (searchQuery && !replacePlaceholders(ci.text).toLowerCase().includes(searchQuery.toLowerCase())) return false;
          return true;
        });

        // Calculate progress including both regular and custom items
        const totalItems = items.length + folderCustomItems.length;
        let doneCount = items.filter(item => checkedItems[itemKey(activeCat.id, fi, item.ii)]).length;
        doneCount += folderCustomItems.filter(ci => checkedItems[customItemKey(activeCat.id, fi, ci.id)]).length;

        const foldProg = totalItems === 0 ? 0 : (doneCount / totalItems) * 100;
        const dotColor = foldProg === 100 ? "#34D399" : foldProg > 0 ? activeCat.color : "rgba(255,255,255,0.15)";
        const dotShadow = foldProg === 100 ? "box-shadow:0 0 8px rgba(52,211,153,0.5)" : "";

        html += `<div class="folder-card${isOpen ? ' open' : ''}">`;
        html += `<button class="folder-btn" data-action="toggle-folder" data-folder-idx="${fi}">
          <div class="dot" style="background:${dotColor};${dotShadow}"></div>
          <span class="folder-name"${isOpen ? ' style="color:var(--text-primary)"' : ''}>\uD83D\uDCC1 ${escAttr(replacePlaceholders(folder.name))}</span>
          <span class="folder-count">${doneCount}/${totalItems}</span>
          <div class="folder-prog"><div class="folder-prog-fill" style="width:${foldProg}%;background:${foldProg === 100 ? '#34D399' : activeCat.color}"></div></div>
          <span class="arrow">\u25BE</span>
        </button>`;

        html += `<div class="folder-body">`;

        // Instructions
        html += `<div class="inst-box" style="background:${activeCat.color}10;border:1px solid ${activeCat.color}20">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
            <div class="inst-label" style="color:${activeCat.color};margin-bottom:0">Instructions for You</div>
            <button class="context-help-btn" data-action="open-context-help" data-context-type="category" data-context-id="${activeCat.id}" style="font-size:11px;padding:2px 8px;background:${activeCat.color}20;color:${activeCat.color};border:none;border-radius:12px;cursor:pointer;display:flex;align-items:center;gap:4px">
              \uD83C\uDFA5 Watch Guide
            </button>
          </div>
          <div class="inst-text">${escAttr(replacePlaceholders(folder.instructions))}</div>
        </div>`;

        // NOK toggle
        const nokKey = `${activeCat.id}-${fi}`;
        html += `<button class="nok-toggle" data-action="toggle-nok" data-nok-key="${nokKey}">${showNok[nokKey] ? '\u25BE' : '\u25B8'} Instructions for ${escAttr(settings.partnerName)} (Next of Kin)</button>`;
        html += `<div class="nok-box${showNok[nokKey] ? ' show' : ''}"><div style="font-size:12px;color:#FBCFE8;line-height:1.5">${escAttr(replacePlaceholders(folder.nokInstructions))}</div></div>`;

        // Links
        if (folder.existingLinks && folder.existingLinks.length > 0) {
          html += `<div class="links-row">`;
          folder.existingLinks.forEach(link => {
            html += `<a href="${link.url}" target="_blank" class="link-chip">\uD83D\uDD17 ${escAttr(replacePlaceholders(link.label))}</a>`;
          });
          html += `</div>`;
        }

        // Checklist items
        items.forEach(item => {
          const key = itemKey(activeCat.id, fi, item.ii);
          const isDone = checkedItems[key];
          const pri = PRIORITY_COLORS[item.priority];
          const tplType = folder.templateType || "generic";
          const tplK = templateKey(activeCat.id, fi, item.ii);
          const hasTplData = templateData[tplK] && Object.keys(templateData[tplK]).length > 0;

          html += `<div class="check-item${isDone ? ' done' : ''}">
            <input type="checkbox" ${isDone ? 'checked' : ''} data-action="toggle-check" data-check-key="${escAttr(key)}">
            <span class="check-text${isDone ? ' done' : ''}">${escAttr(replacePlaceholders(item.text))}</span>
            <button class="detail-btn" style="${hasTplData ? 'background:rgba(52,211,153,0.15);border-color:rgba(52,211,153,0.3);color:#6EE7B7' : ''}" data-action="open-template" data-tpl-cat="${activeCat.id}" data-tpl-fi="${fi}" data-tpl-ii="${item.ii}" data-tpl-type="${tplType}" title="Fill in details for this item">${hasTplData ? '\u2713 Details' : '+ Details'}</button>
            <span class="priority-badge" style="background:${pri.dot}20;color:${pri.dot}">${pri.label}</span>
          </div>`;
        });

        // Custom checklist items (using already filtered folderCustomItems from above)
        folderCustomItems.forEach(customItem => {
          const customKey = customItemKey(activeCat.id, fi, customItem.id);
          const isDone = checkedItems[customKey];
          const pri = PRIORITY_COLORS[customItem.priority];
          const customTplK = customTemplateKey(activeCat.id, fi, customItem.id);
          const hasTplData = templateData[customTplK] && Object.keys(templateData[customTplK]).length > 0;

          html += `<div class="check-item custom-item${isDone ? ' done' : ''}">
            <input type="checkbox" ${isDone ? 'checked' : ''} data-action="toggle-check" data-check-key="${escAttr(customKey)}">
            <span class="check-text${isDone ? ' done' : ''}">${escAttr(replacePlaceholders(customItem.text))}</span>
            <button class="detail-btn" style="${hasTplData ? 'background:rgba(52,211,153,0.15);border-color:rgba(52,211,153,0.3);color:#6EE7B7' : ''}" data-action="open-custom-template" data-tpl-cat="${activeCat.id}" data-tpl-fi="${fi}" data-custom-id="${customItem.id}" title="Fill in details for this item">${hasTplData ? '\u2713 Details' : '+ Details'}</button>
            <span class="priority-badge" style="background:${pri.dot}20;color:${pri.dot}">${pri.label}</span>
            <button class="delete-custom-btn" data-action="delete-custom-item" data-cat="${activeCat.id}" data-fi="${fi}" data-custom-id="${customItem.id}" title="Delete this custom item">&times;</button>
          </div>`;
        });

        // Add custom item button
        html += `<button class="add-custom-item-btn" data-action="open-custom-item-modal" data-cat="${activeCat.id}" data-fi="${fi}">
          <span class="add-icon">+</span> Add Custom Item
        </button>`;

        html += `</div></div>`; // folder-body, folder-card
      });
    }

    html += `</div></div>`; // detail, main

    // FOOTER
    html += `<div class="footer"><p>${escAttr(settings.familyName)} Life Vault &middot; ${getProcessedCategories().length} Categories &middot; ${stats.folders} Folders &middot; ${stats.total} Items</p></div>`;

    // MODALS
    if (modalOpen) {
      html += renderModal();
    }

    if (settingsModalOpen) {
      html += renderSettingsModal();
    }

    if (helpModalOpen) {
      html += renderHelpModal();
    }

    if (customItemModalOpen) {
      html += renderCustomItemModal();
    }

    document.getElementById("app").innerHTML = html;

    // Re-focus search input and restore cursor position
    const searchEl = document.getElementById("search-input");
    if (searchEl && searchQuery) {
      searchEl.focus();
      searchEl.setSelectionRange(searchQuery.length, searchQuery.length);
    }

    // Re-focus resource search input
    const resSearchEl = document.getElementById("resource-search-input");
    if (resSearchEl && helpResourceSearchQuery) {
      resSearchEl.focus();
      resSearchEl.setSelectionRange(helpResourceSearchQuery.length, helpResourceSearchQuery.length);
    }
  }

  function renderModal() {
    const { catId, folderIdx, itemIdx, templateType, isCustom, customItemId } = modalOpen;
    const tpl = TEMPLATES[templateType];
    if (!tpl) return '';

    const cat = getProcessedCategories().find(c => c.id === catId);
    const folder = cat ? cat.folders[folderIdx] : null;

    let item = null;
    let tplK = '';

    if (isCustom && customItemId) {
      // Custom item template
      const folderCustomItems = getCustomItemsForFolder(catId, folderIdx);
      item = folderCustomItems.find(ci => ci.id === customItemId);
      tplK = customTemplateKey(catId, folderIdx, customItemId);
    } else {
      // Regular item template
      item = folder ? folder.items[itemIdx] : null;
      tplK = templateKey(catId, folderIdx, itemIdx);
    }

    const savedData = templateData[tplK] || {};

    let html = `<div class="modal-overlay" data-action="close-modal-overlay">
      <div class="modal" data-modal-inner="true">
        <div class="modal-header">
          <div>
            <div class="modal-title">${tpl.icon} ${escAttr(replacePlaceholders(tpl.title))}</div>
            <div style="font-size:12px;color:#94A3B8;margin-top:4px">${item ? escAttr(replacePlaceholders(item.text)) : ''}</div>
          </div>
          <button class="modal-close" data-action="close-modal">&times;</button>
        </div>
        <div class="modal-body">`;

    tpl.sections.forEach(section => {
      html += `<div class="tpl-section">
        <div class="tpl-section-title">${escAttr(replacePlaceholders(section.title))}</div>`;
      section.fields.forEach(field => {
        const val = savedData[field.id] || '';
        const escapedVal = escAttr(val);
        html += `<div class="tpl-field">
            <label class="tpl-label">${escAttr(replacePlaceholders(field.label))}</label>`;
        if (field.type === "textarea") {
          html += `<textarea class="tpl-textarea" id="field-${field.id}" placeholder="Enter details...">${val.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</textarea>`;
        } else {
          html += `<input class="tpl-input" id="field-${field.id}" type="text" value="${escapedVal}" placeholder="Enter details...">`;
        }
        if (field.hint) {
          html += `<div class="tpl-hint">${escAttr(replacePlaceholders(field.hint))}</div>`;
        }
        html += `</div>`;
      });
      html += `</div>`;
    });

    html += `<div style="display:flex;gap:8px;margin-top:20px;flex-wrap:wrap">
          <button class="save-btn" data-action="save-template">Save Details</button>
          <button class="export-btn" data-action="export-template">Export as Markdown</button>
          <button class="export-btn" data-action="export-pdf" style="background:rgba(99,102,241,0.15);border-color:rgba(99,102,241,0.3);color:#A5B4FC">Export as PDF</button>
        </div>
      </div></div></div>`;

    return html;
  }

  // === ACTION HANDLERS ===
  function handleAction(action, el) {
    switch (action) {
      // Setup wizard actions
      case "setup-next": {
        // Save current step data
        saveSetupStepData();
        currentSetupStep++;
        render();
        break;
      }
      case "setup-prev": {
        currentSetupStep--;
        render();
        break;
      }
      case "setup-complete": {
        setupComplete = true;
        saveData(STORAGE_KEYS.setupComplete, true);
        invalidateProcessedCategories();
        saveData(STORAGE_KEYS.settings, settings);
        render();
        break;
      }
      case "add-child": {
        settings.children = settings.children || [];
        settings.children.push('');
        render();
        break;
      }
      case "remove-child": {
        const idx = parseInt(el.dataset.childIndex, 10);
        settings.children.splice(idx, 1);
        render();
        break;
      }
      // Settings modal actions
      case "open-settings": {
        settingsModalOpen = true;
        render();
        break;
      }
      case "close-settings": {
        settingsModalOpen = false;
        render();
        break;
      }
      case "save-settings": {
        saveSettingsFromModal();
        settingsModalOpen = false;
        render();
        break;
      }
      case "settings-add-child": {
        settings.children = settings.children || [];
        settings.children.push('');
        render();
        break;
      }
      case "settings-remove-child": {
        const idx = parseInt(el.dataset.childIndex, 10);
        settings.children.splice(idx, 1);
        render();
        break;
      }
      case "settings-add-bank": {
        settings.bankAccounts = settings.bankAccounts || [];
        settings.bankAccounts.push({ name: '', type: 'checking' });
        render();
        break;
      }
      case "settings-remove-bank": {
        const idx = parseInt(el.dataset.bankIndex, 10);
        settings.bankAccounts.splice(idx, 1);
        render();
        break;
      }
      case "settings-add-link": {
        settings.quickLinks = settings.quickLinks || [];
        settings.quickLinks.push({ label: '', url: '' });
        render();
        break;
      }
      case "settings-remove-link": {
        const idx = parseInt(el.dataset.linkIndex, 10);
        settings.quickLinks.splice(idx, 1);
        render();
        break;
      }
      case "import-data": {
        document.getElementById('import-file-input').click();
        break;
      }
      // Help modal actions
      case "open-help": {
        helpModalOpen = true;
        helpActiveSection = "overview";
        helpSearchQuery = "";
        helpExpandedCategories = {};
        helpExpandedResources = {};
        helpActiveResourceVideo = null;
        helpResourceSearchQuery = "";
        render();
        break;
      }
      case "close-help": {
        helpModalOpen = false;
        render();
        break;
      }
      case "help-set-section": {
        helpActiveSection = el.dataset.section;
        render();
        break;
      }
      case "open-context-help": {
        const catId = el.dataset.contextId;
        helpModalOpen = true;
        helpActiveSection = "categories";
        helpExpandedCategories[catId] = true;
        helpSearchQuery = ""; // Clear search to ensure category is visible
        render();

        // Scroll to category after render
        setTimeout(() => {
          const catEl = document.getElementById(`help-cat-${catId}`);
          if (catEl) {
            catEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            // Flash effect
            catEl.style.transition = 'background 0.3s';
            const originalBg = catEl.style.background;
            catEl.style.background = 'rgba(255, 255, 0, 0.1)';
            setTimeout(() => {
              catEl.style.background = originalBg;
            }, 1000);
          }
        }, 100);
        break;
      }
      case "help-toggle-category": {
        const catId = el.dataset.catId;
        helpExpandedCategories[catId] = !helpExpandedCategories[catId];
        render();
        break;
      }
      case "help-toggle-resource": {
        const resId = el.dataset.resourceId;
        helpExpandedResources[resId] = !helpExpandedResources[resId];
        // Close any open video when collapsing a resource category
        if (!helpExpandedResources[resId]) {
          helpActiveResourceVideo = null;
        }
        render();
        break;
      }
      case "help-toggle-video": {
        const videoKey = el.dataset.videoKey;
        if (helpActiveResourceVideo === videoKey) {
          helpActiveResourceVideo = null;
        } else {
          helpActiveResourceVideo = videoKey;
        }
        render();
        break;
      }
      // Theme toggle
      case "toggle-theme": {
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        applyTheme(newTheme);
        render();
        break;
      }
      case "set-theme": {
        const theme = el.dataset.theme;
        if (theme) {
          applyTheme(theme);
          render();
        }
        break;
      }
      // Main app actions
      case "select-category": {
        const id = el.dataset.catId;
        activeCategory = activeCategory === id ? null : id;
        activeFolder = null;
        render();
        break;
      }
      case "toggle-folder": {
        const idx = parseInt(el.dataset.folderIdx, 10);
        activeFolder = activeFolder === idx ? null : idx;
        render();
        break;
      }
      case "set-filter": {
        filter = el.dataset.filter;
        render();
        break;
      }
      case "toggle-check": {
        const key = el.dataset.checkKey;
        checkedItems[key] = !checkedItems[key];
        saveData(STORAGE_KEYS.checked, checkedItems);
        render();
        break;
      }
      case "toggle-nok": {
        const key = el.dataset.nokKey;
        showNok[key] = !showNok[key];
        render();
        break;
      }
      case "open-template": {
        modalOpen = {
          catId: el.dataset.tplCat,
          folderIdx: parseInt(el.dataset.tplFi, 10),
          itemIdx: parseInt(el.dataset.tplIi, 10),
          templateType: el.dataset.tplType
        };
        render();
        break;
      }
      case "close-modal-overlay": {
        if (el.classList.contains("modal-overlay")) {
          if (settingsModalOpen) {
            settingsModalOpen = false;
          } else if (helpModalOpen) {
            helpModalOpen = false;
          } else if (customItemModalOpen) {
            customItemModalOpen = null;
          } else {
            modalOpen = null;
          }
          render();
        }
        break;
      }
      case "close-modal": {
        modalOpen = null;
        render();
        break;
      }
      case "save-template": {
        doSaveTemplate();
        break;
      }
      case "export-template": {
        doExportTemplate();
        break;
      }
      case "export-pdf": {
        doExportPDF();
        break;
      }
      case "export-all": {
        doExportAllData();
        break;
      }
      case "reset-all": {
        if (confirm("Reset ALL checkboxes? This cannot be undone. Template data will be preserved.")) {
          checkedItems = {};
          saveData(STORAGE_KEYS.checked, checkedItems);
          render();
        }
        break;
      }
      // Custom item actions
      case "open-custom-item-modal": {
        customItemModalOpen = {
          catId: el.dataset.cat,
          folderIdx: parseInt(el.dataset.fi, 10)
        };
        render();
        break;
      }
      case "close-custom-item-modal": {
        customItemModalOpen = null;
        render();
        break;
      }
      case "save-custom-item": {
        doSaveCustomItem();
        break;
      }
      case "delete-custom-item": {
        const catId = el.dataset.cat;
        const fi = parseInt(el.dataset.fi, 10);
        const itemId = el.dataset.customId;
        if (confirm("Delete this custom item? This cannot be undone.")) {
          doDeleteCustomItem(catId, fi, itemId);
        }
        break;
      }
      case "open-custom-template": {
        modalOpen = {
          catId: el.dataset.tplCat,
          folderIdx: parseInt(el.dataset.tplFi, 10),
          customItemId: el.dataset.customId,
          templateType: "custom_item",
          isCustom: true
        };
        render();
        break;
      }
    }
  }

  function saveSetupStepData() {
    // Save family name and primary user
    const familyNameEl = document.getElementById('setup-familyName');
    if (familyNameEl) settings.familyName = familyNameEl.value || DEFAULT_SETTINGS.familyName;

    const primaryUserEl = document.getElementById('setup-primaryUserName');
    if (primaryUserEl) settings.primaryUserName = primaryUserEl.value || DEFAULT_SETTINGS.primaryUserName;

    const partnerEl = document.getElementById('setup-partnerName');
    if (partnerEl) settings.partnerName = partnerEl.value || DEFAULT_SETTINGS.partnerName;

    // Save children
    const childInputs = document.querySelectorAll('[data-child-index]');
    if (childInputs.length > 0) {
      settings.children = [];
      childInputs.forEach(input => {
        if (input.value.trim()) {
          settings.children.push(input.value.trim());
        }
      });
      if (settings.children.length === 0) {
        settings.children = ['Child'];
      }
    }

    invalidateProcessedCategories();
    saveData(STORAGE_KEYS.settings, settings);
  }

  function saveSettingsFromModal() {
    // Save family info
    const familyNameEl = document.getElementById('settings-familyName');
    if (familyNameEl) settings.familyName = familyNameEl.value || DEFAULT_SETTINGS.familyName;

    const primaryUserEl = document.getElementById('settings-primaryUserName');
    if (primaryUserEl) settings.primaryUserName = primaryUserEl.value || DEFAULT_SETTINGS.primaryUserName;

    const partnerEl = document.getElementById('settings-partnerName');
    if (partnerEl) settings.partnerName = partnerEl.value || DEFAULT_SETTINGS.partnerName;

    // Save children
    const childInputs = document.querySelectorAll('[data-settings-child-index]');
    if (childInputs.length > 0) {
      settings.children = [];
      childInputs.forEach(input => {
        if (input.value.trim()) {
          settings.children.push(input.value.trim());
        }
      });
      if (settings.children.length === 0) {
        settings.children = ['Child'];
      }
    }

    // Save bank accounts
    const bankInputs = document.querySelectorAll('[data-settings-bank-index]');
    const bankMap = {};
    bankInputs.forEach(input => {
      const idx = input.dataset.settingsBankIndex;
      const field = input.dataset.field;
      if (!bankMap[idx]) bankMap[idx] = {};
      bankMap[idx][field] = input.value;
    });
    settings.bankAccounts = Object.values(bankMap).filter(b => b.name);

    // Save quick links
    const linkInputs = document.querySelectorAll('[data-settings-link-index]');
    const linkMap = {};
    linkInputs.forEach(input => {
      const idx = input.dataset.settingsLinkIndex;
      const field = input.dataset.field;
      if (!linkMap[idx]) linkMap[idx] = {};
      linkMap[idx][field] = input.value;
    });
    settings.quickLinks = Object.values(linkMap).filter(l => l.label && l.url);

    invalidateProcessedCategories();
    saveData(STORAGE_KEYS.settings, settings);
  }

  function doSaveTemplate() {
    if (!modalOpen) return;
    const { catId, folderIdx, itemIdx, templateType, isCustom, customItemId } = modalOpen;
    const tpl = TEMPLATES[templateType];
    if (!tpl) return;

    // Determine the correct template key based on whether this is a custom item
    const tplK = isCustom && customItemId
      ? customTemplateKey(catId, folderIdx, customItemId)
      : templateKey(catId, folderIdx, itemIdx);

    const data = {};
    tpl.sections.forEach(section => {
      section.fields.forEach(field => {
        const el = document.getElementById(`field-${field.id}`);
        if (el) data[field.id] = el.value;
      });
    });
    templateData[tplK] = data;
    saveData(STORAGE_KEYS.templates, templateData);

    const btn = document.querySelector('[data-action="save-template"]');
    if (btn) {
      btn.textContent = 'Saved!';
      btn.style.background = '#059669';
      setTimeout(() => { btn.textContent = 'Save Details'; btn.style.background = ''; }, 1500);
    }
  }

  function doExportTemplate() {
    if (!modalOpen) return;
    const { catId, folderIdx, itemIdx, templateType, isCustom, customItemId } = modalOpen;
    const tpl = TEMPLATES[templateType];
    if (!tpl) return;

    const cat = getProcessedCategories().find(c => c.id === catId);
    const folder = cat ? cat.folders[folderIdx] : null;

    let item = null;
    let tplK = '';

    if (isCustom && customItemId) {
      const folderCustomItems = getCustomItemsForFolder(catId, folderIdx);
      item = folderCustomItems.find(ci => ci.id === customItemId);
      tplK = customTemplateKey(catId, folderIdx, customItemId);
    } else {
      item = folder ? folder.items[itemIdx] : null;
      tplK = templateKey(catId, folderIdx, itemIdx);
    }

    const data = templateData[tplK] || {};

    let md = `# ${tpl.icon} ${replacePlaceholders(tpl.title)}\n\n`;
    md += `---\n\n`;
    md += `| **Field** | **Value** |\n`;
    md += `|-----------|----------|\n`;
    md += `| **Item** | ${item ? replacePlaceholders(item.text) : 'N/A'} |\n`;
    md += `| **Category** | ${cat ? cat.icon + ' ' + replacePlaceholders(cat.name) : 'N/A'} |\n`;
    md += `| **Folder** | \uD83D\uDCC1 ${folder ? replacePlaceholders(folder.name) : 'N/A'} |\n`;
    md += `| **Date Exported** | ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} |\n\n`;
    md += `---\n\n`;

    tpl.sections.forEach(section => {
      md += `## ${replacePlaceholders(section.title)}\n\n`;
      section.fields.forEach(field => {
        const val = data[field.id];
        if (val && val.trim()) {
          if (val.includes('\n')) {
            md += `### ${replacePlaceholders(field.label)}\n\n`;
            md += `${val}\n\n`;
          } else {
            md += `- **${replacePlaceholders(field.label)}:** ${val}\n`;
          }
        } else {
          md += `- **${replacePlaceholders(field.label)}:** *Not filled*\n`;
        }
      });
      md += `\n`;
    });

    md += `---\n\n`;
    md += `> *Exported from ${settings.familyName} Life Vault*\n`;

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tpl.title.replace(/[^a-zA-Z0-9]/g, '_')}_${catId}_${folderIdx}_${itemIdx}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function doExportPDF() {
    if (!modalOpen) return;
    const { catId, folderIdx, itemIdx, templateType, isCustom, customItemId } = modalOpen;
    const tpl = TEMPLATES[templateType];
    if (!tpl) return;

    const cat = getProcessedCategories().find(c => c.id === catId);
    const folder = cat ? cat.folders[folderIdx] : null;

    let item = null;
    let tplK = '';

    if (isCustom && customItemId) {
      const folderCustomItems = getCustomItemsForFolder(catId, folderIdx);
      item = folderCustomItems.find(ci => ci.id === customItemId);
      tplK = customTemplateKey(catId, folderIdx, customItemId);
    } else {
      item = folder ? folder.items[itemIdx] : null;
      tplK = templateKey(catId, folderIdx, itemIdx);
    }

    const data = templateData[tplK] || {};

    let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${replacePlaceholders(tpl.title)} - ${settings.familyName} Life Vault</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 11pt;
      line-height: 1.5;
      color: #1a1a1a;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
    }
    .header {
      border-bottom: 3px solid #6366F1;
      padding-bottom: 20px;
      margin-bottom: 24px;
    }
    .title {
      font-size: 24pt;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 8px;
    }
    .meta-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
      font-size: 10pt;
    }
    .meta-table td {
      padding: 6px 12px;
      border: 1px solid #e2e8f0;
    }
    .meta-table td:first-child {
      background: #f8fafc;
      font-weight: 600;
      width: 120px;
      color: #475569;
    }
    .section {
      margin-bottom: 24px;
      page-break-inside: avoid;
    }
    .section-title {
      font-size: 14pt;
      font-weight: 700;
      color: #6366F1;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 6px;
      margin-bottom: 12px;
    }
    .field {
      margin-bottom: 10px;
    }
    .field-label {
      font-weight: 600;
      color: #334155;
      font-size: 10pt;
    }
    .field-value {
      color: #1e293b;
      margin-left: 8px;
    }
    .field-value.empty {
      color: #94a3b8;
      font-style: italic;
    }
    .field-multiline {
      margin-top: 4px;
      padding: 8px 12px;
      background: #f8fafc;
      border-left: 3px solid #6366F1;
      white-space: pre-wrap;
    }
    .footer {
      margin-top: 32px;
      padding-top: 16px;
      border-top: 1px solid #e2e8f0;
      font-size: 9pt;
      color: #64748b;
      text-align: center;
    }
    @media print {
      body { padding: 20px; }
      .no-print { display: none; }
    }
    .print-btn {
      position: fixed;
      top: 20px;
      right: 20px;
      background: #6366F1;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    }
    .print-btn:hover { background: #4f46e5; }
  </style>
</head>
<body>
  <button class="print-btn no-print">\uD83D\uDDA8\uFE0F Print / Save as PDF</button>

  <div class="header">
    <div class="title">${tpl.icon} ${replacePlaceholders(tpl.title)}</div>
  </div>

  <table class="meta-table">
    <tr><td>Item</td><td>${item ? replacePlaceholders(item.text) : 'N/A'}</td></tr>
    <tr><td>Category</td><td>${cat ? cat.icon + ' ' + replacePlaceholders(cat.name) : 'N/A'}</td></tr>
    <tr><td>Folder</td><td>\uD83D\uDCC1 ${folder ? replacePlaceholders(folder.name) : 'N/A'}</td></tr>
    <tr><td>Exported</td><td>${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td></tr>
  </table>`;

    tpl.sections.forEach(section => {
      html += `<div class="section">
    <div class="section-title">${replacePlaceholders(section.title)}</div>`;
      section.fields.forEach(field => {
        const val = data[field.id];
        const escapedVal = val ? val.replace(/</g, '&lt;').replace(/>/g, '&gt;') : '';
        if (val && val.trim()) {
          if (val.includes('\n')) {
            html += `<div class="field">
      <div class="field-label">${replacePlaceholders(field.label)}:</div>
      <div class="field-multiline">${escapedVal}</div>
    </div>`;
          } else {
            html += `<div class="field">
      <span class="field-label">${replacePlaceholders(field.label)}:</span>
      <span class="field-value">${escapedVal}</span>
    </div>`;
          }
        } else {
          html += `<div class="field">
      <span class="field-label">${replacePlaceholders(field.label)}:</span>
      <span class="field-value empty">Not filled</span>
    </div>`;
        }
      });
      html += `</div>`;
    });

    html += `<div class="footer">
      Exported from <strong>${settings.familyName} Life Vault</strong> &bull; ${new Date().toLocaleDateString()}
    </div>
    <script>
      document.querySelector('.print-btn').addEventListener('click', function() {
        window.print();
      });
    </script>
</body>
</html>`;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
    } else {
      alert('Please allow pop-ups to export as PDF');
    }
  }

  function doExportAllData() {
    const exportObj = {
      checkedItems: checkedItems,
      templateData: templateData,
      settings: settings,
      customItems: customItems,
      exportDate: new Date().toISOString(),
      version: "1.5.0"
    };
    const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `life-vault-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function doImportData(file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const data = JSON.parse(e.target.result);
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
        alert('Data imported successfully!');
        render();
      } catch (err) {
        alert('Error importing data: ' + err.message);
      }
    };
    reader.readAsText(file);
  }

  function doSaveCustomItem() {
    if (!customItemModalOpen) return;
    const { catId, folderIdx } = customItemModalOpen;

    const textEl = document.getElementById('custom-item-text');
    const priorityEl = document.querySelector('input[name="custom-item-priority"]:checked');

    if (!textEl || !textEl.value.trim()) {
      alert('Please enter an item description.');
      return;
    }

    const text = textEl.value.trim();
    const priority = priorityEl ? priorityEl.value : 'important';
    const itemId = generateCustomItemId();

    const key = folderKey(catId, folderIdx);
    if (!customItems[key]) {
      customItems[key] = [];
    }

    customItems[key].push({
      id: itemId,
      text: text,
      priority: priority,
      createdAt: Date.now()
    });

    saveData(STORAGE_KEYS.customItems, customItems);
    customItemModalOpen = null;
    render();
  }

  function doDeleteCustomItem(catId, fi, itemId) {
    const key = folderKey(catId, fi);
    if (customItems[key]) {
      customItems[key] = customItems[key].filter(item => item.id !== itemId);
      if (customItems[key].length === 0) {
        delete customItems[key];
      }
      saveData(STORAGE_KEYS.customItems, customItems);

      // Also remove associated template data and checked status
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

      render();
    }
  }

  // === DELEGATED EVENT LISTENERS (CSP-compliant, no inline handlers) ===
  document.getElementById("app").addEventListener("click", function (e) {
    let el = e.target;
    while (el && el !== this) {
      if (el.dataset && el.dataset.action) {
        if (el.dataset.action !== "toggle-check") {
          if (el.dataset.action === "close-modal-overlay") {
            if (e.target === el) {
              handleAction(el.dataset.action, el);
            }
            return;
          }
          handleAction(el.dataset.action, el);
        }
        return;
      }
      el = el.parentElement;
    }
  });

  document.getElementById("app").addEventListener("change", function (e) {
    let el = e.target;
    while (el && el !== this) {
      if (el.dataset && el.dataset.action === "toggle-check") {
        handleAction("toggle-check", el);
        return;
      }
      el = el.parentElement;
    }

    // Handle file import
    if (e.target.id === 'import-file-input' && e.target.files.length > 0) {
      doImportData(e.target.files[0]);
      e.target.value = '';
    }
  });

  document.getElementById("app").addEventListener("input", function (e) {
    if (e.target.id === "search-input") {
      searchQuery = e.target.value;
      clearTimeout(window._searchTimeout);
      window._searchTimeout = setTimeout(function () {
        render();
      }, 200);
    }
    if (e.target.id === "help-search-input") {
      helpSearchQuery = e.target.value;
      clearTimeout(window._helpSearchTimeout);
      window._helpSearchTimeout = setTimeout(function () {
        render();
      }, 200);
    }
    if (e.target.id === "resource-search-input") {
      helpResourceSearchQuery = e.target.value;
      clearTimeout(window._resourceSearchTimeout);
      window._resourceSearchTimeout = setTimeout(function () {
        render();
      }, 200);
    }
  });

  // Hover effects for dashboard cards
  document.getElementById("app").addEventListener("mouseenter", function (e) {
    const card = e.target.closest('.dash-card[data-hover-color]');
    if (card) {
      card.style.borderColor = card.dataset.hoverColor;
      card.style.background = 'rgba(255,255,255,0.05)';
    }
  }, true);

  document.getElementById("app").addEventListener("mouseleave", function (e) {
    const card = e.target.closest('.dash-card[data-hover-color]');
    if (card) {
      card.style.borderColor = '';
      card.style.background = '';
    }
  }, true);
})();
