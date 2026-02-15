// Family Life Vault — Main Application Engine
// Chrome Extension Tab Page — Vanilla JS, NO inline handlers (CSP compliant)

(function () {
  "use strict";

  // === STORAGE KEYS ===
  const STORAGE_KEYS = {
    checked: "lifeorg-checked",
    templates: "lifeorg-templates",
    settings: "lifeorg-settings",
    setupComplete: "lifeorg-setup-complete"
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
    quickLinks: []
  };

  // State initialized as empty, populated async
  let checkedItems = {};
  let templateData = {};
  let settings = { ...DEFAULT_SETTINGS };
  let setupComplete = false;

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
  let currentSetupStep = 0;

  function saveData(key, data) {
    chrome.storage.local.set({ [key]: data });
  }

  // Initialize data from chrome.storage.local
  chrome.storage.local.get([
    STORAGE_KEYS.checked,
    STORAGE_KEYS.templates,
    STORAGE_KEYS.settings,
    STORAGE_KEYS.setupComplete
  ], (result) => {
    checkedItems = result[STORAGE_KEYS.checked] || {};
    templateData = result[STORAGE_KEYS.templates] || {};
    settings = result[STORAGE_KEYS.settings] || { ...DEFAULT_SETTINGS };
    setupComplete = result[STORAGE_KEYS.setupComplete] || false;
    render();
  });

  // === HELPERS ===
  function itemKey(catId, fi, ii) { return `${catId}-${fi}-${ii}`; }
  function templateKey(catId, fi, ii) { return `tpl-${catId}-${fi}-${ii}`; }

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
    const HELP_VIDEOS = [
      {
        title: "Estate Planning Basics",
        desc: "Learn the fundamentals of estate planning from the ACTEC Foundation video library.",
        url: "https://www.actec.org/resource-center/video/",
        source: "ACTEC"
      },
      {
        title: "Wills vs Trusts Explained",
        desc: "Understand the key differences between wills and living trusts for avoiding probate.",
        url: "https://www.ramseysolutions.com/retirement/what-is-a-living-trust",
        source: "Ramsey Solutions"
      },
      {
        title: "Term vs Whole Life Insurance",
        desc: "A beginner-friendly explanation of the two main types of life insurance.",
        url: "https://www.trustage.com/learn/life-insurance/term-vs-whole-life-insurance-video",
        source: "TrustAge"
      },
      {
        title: "401(k) vs IRA Explained",
        desc: "Understand retirement account types and how to prioritize your savings.",
        url: "https://www.fidelity.com/learning-center/smart-money/ira-vs-401k",
        source: "Fidelity"
      },
      {
        title: "Power of Attorney & Healthcare Directives",
        desc: "Learn why POA and healthcare directives are critical estate planning documents.",
        url: "https://www.actec.org/resource-center/",
        source: "ACTEC"
      },
      {
        title: "Beneficiary Designations",
        desc: "Why beneficiary designations override your will and how to keep them updated.",
        url: "https://www.wealth.com/resources/estate-planning/beneficiary-designation-explained/",
        source: "Wealth.com"
      },
      {
        title: "Digital Estate Planning",
        desc: "How to organize digital accounts and password managers for your family.",
        url: "https://blog.1password.com/get-started-digital-estate-planning/",
        source: "1Password"
      },
      {
        title: "COBRA Health Insurance",
        desc: "Understand your rights to continue health coverage after job loss or death of spouse.",
        url: "https://www.dol.gov/general/topic/health-plans/cobra",
        source: "Dept. of Labor"
      }
    ];

    let html = `<div class="modal-overlay" data-action="close-modal-overlay">
      <div class="modal help-modal" data-modal-inner="true">
        <div class="modal-header">
          <div class="modal-title">\uD83D\uDCD6 Help Guide</div>
          <button class="modal-close" data-action="close-help">&times;</button>
        </div>
        <div class="modal-body">

          <input class="help-search" type="text" placeholder="Search help topics..." value="${escAttr(helpSearchQuery)}" id="help-search-input">

          <div class="help-nav">
            <button class="help-nav-btn${helpActiveSection === 'overview' ? ' active' : ''}" data-action="help-set-section" data-section="overview">Overview</button>
            <button class="help-nav-btn${helpActiveSection === 'categories' ? ' active' : ''}" data-action="help-set-section" data-section="categories">All Categories</button>
            <button class="help-nav-btn${helpActiveSection === 'videos' ? ' active' : ''}" data-action="help-set-section" data-section="videos">Video Guides</button>
            <button class="help-nav-btn${helpActiveSection === 'tips' ? ' active' : ''}" data-action="help-set-section" data-section="tips">Tips</button>
          </div>`;

    // Filter categories by search
    const searchLower = helpSearchQuery.toLowerCase();
    const filteredCategories = getProcessedCategories().filter(cat => {
      if (!helpSearchQuery) return true;
      if (cat.name.toLowerCase().includes(searchLower)) return true;
      if (cat.description.toLowerCase().includes(searchLower)) return true;
      return cat.folders.some(f =>
        f.name.toLowerCase().includes(searchLower) ||
        f.instructions.toLowerCase().includes(searchLower)
      );
    });

    if (helpActiveSection === 'overview') {
      html += `
        <div class="help-intro">
          <h3>\uD83D\uDEE1\uFE0F Welcome to Family Life Vault</h3>
          <p>This comprehensive system helps you organize everything your family needs in case of emergency.
          With <strong>${getProcessedCategories().length} categories</strong> and <strong>${getStats().folders} folders</strong> covering
          <strong>${getStats().total} actionable items</strong>, you can systematically document your entire digital legacy.</p>
        </div>

        <div class="help-section">
          <div class="help-section-title">\uD83D\uDEA6 Getting Started</div>

          <div class="help-tip">
            <div class="help-tip-title">Step 1: Start with Critical Items</div>
            <div class="help-tip-text">Use the "Critical" filter at the top to focus on the most important items first. These are marked in red and should be your first priority.</div>
          </div>

          <div class="help-tip">
            <div class="help-tip-title">Step 2: Fill in Details</div>
            <div class="help-tip-text">Don't just check boxes - click "+ Details" on each item to fill in the detailed template. This information is what your family actually needs.</div>
          </div>

          <div class="help-tip">
            <div class="help-tip-title">Step 3: Export & Backup</div>
            <div class="help-tip-text">Use "Export Data" regularly to create backups. Store the JSON file securely. You can also export individual items as PDF or Markdown.</div>
          </div>

          <div class="help-tip">
            <div class="help-tip-title">Step 4: Share with Your NOK</div>
            <div class="help-tip-text">Each folder has "Instructions for ${escAttr(settings.partnerName)} (Next of Kin)" - expandable sections with specific guidance for your family member.</div>
          </div>
        </div>

        <div class="help-section">
          <div class="help-section-title">\uD83C\uDFA5 Recommended Learning</div>`;

      HELP_VIDEOS.slice(0, 4).forEach(video => {
        html += `
          <div class="help-video-card">
            <div class="help-video-icon">\uD83C\uDFAC</div>
            <div class="help-video-info">
              <div class="help-video-title">${video.title}</div>
              <div class="help-video-desc">${video.desc}</div>
              <a href="${video.url}" target="_blank" class="help-video-link">\u25B6 Learn More (${video.source})</a>
            </div>
          </div>`;
      });

      html += `</div>`;
    }

    if (helpActiveSection === 'categories') {
      html += `<div class="help-section">
        <div class="help-section-title">\uD83D\uDCC1 All ${filteredCategories.length} Categories</div>`;

      filteredCategories.forEach(cat => {
        const isExpanded = helpExpandedCategories[cat.id];
        const folderCount = cat.folders.length;
        const itemCount = cat.folders.reduce((a, f) => a + f.items.length, 0);

        html += `
          <div class="help-category${isExpanded ? ' open' : ''}">
            <div class="help-category-header" data-action="help-toggle-category" data-cat-id="${cat.id}">
              <div class="help-category-icon" style="background:${cat.color}20;border:1px solid ${cat.color}30">${cat.icon}</div>
              <div class="help-category-info">
                <div class="help-category-name">${escAttr(replacePlaceholders(cat.name))}</div>
                <div class="help-category-desc">${escAttr(replacePlaceholders(cat.description))}</div>
                <div class="help-category-meta">${folderCount} folders \u2022 ${itemCount} items</div>
              </div>
              <span class="help-category-arrow">\u25BE</span>
            </div>
            <div class="help-category-body">`;

        cat.folders.forEach(folder => {
          html += `
              <div class="help-folder">
                <div class="help-folder-name">\uD83D\uDCC2 ${escAttr(replacePlaceholders(folder.name))}</div>
                <div class="help-folder-instructions">${escAttr(replacePlaceholders(folder.instructions))}</div>
                <div class="help-folder-items">${folder.items.length} checklist items</div>
              </div>`;
        });

        html += `</div></div>`;
      });

      html += `</div>`;
    }

    if (helpActiveSection === 'videos') {
      html += `<div class="help-section">
        <div class="help-section-title">\uD83C\uDFA5 Video Guides & Resources</div>
        <p style="font-size:12px;color:#94A3B8;margin-bottom:16px">These curated resources explain key estate planning concepts in easy-to-understand terms.</p>`;

      HELP_VIDEOS.forEach(video => {
        html += `
          <div class="help-video-card">
            <div class="help-video-icon">\uD83C\uDFAC</div>
            <div class="help-video-info">
              <div class="help-video-title">${video.title}</div>
              <div class="help-video-desc">${video.desc}</div>
              <a href="${video.url}" target="_blank" class="help-video-link">\u25B6 Learn More (${video.source})</a>
            </div>
          </div>`;
      });

      html += `
        <div class="help-tip" style="margin-top:16px">
          <div class="help-tip-title">\uD83D\uDCA1 More Resources</div>
          <div class="help-tip-text">
            <strong>Khan Academy</strong> - Free personal finance courses<br>
            <strong>Nolo.com</strong> - Legal self-help guides<br>
            <strong>Consumer.gov</strong> - Government consumer resources<br>
            <strong>SSA.gov</strong> - Social Security Administration guides
          </div>
        </div>
      </div>`;
    }

    if (helpActiveSection === 'tips') {
      html += `<div class="help-section">
        <div class="help-section-title">\uD83D\uDCA1 Tips for Success</div>

        <div class="help-tip">
          <div class="help-tip-title">\uD83D\uDEA8 Start with the Essentials</div>
          <div class="help-tip-text">Focus first on: Will, Healthcare Directive, Power of Attorney, Life Insurance beneficiaries, and Account access credentials. These are the most critical items if something happens.</div>
        </div>

        <div class="help-tip">
          <div class="help-tip-title">\uD83D\uDCCA Track Your Progress</div>
          <div class="help-tip-text">The progress rings show your completion percentage. Aim to get "Critical" items to 100% first, then work on "Important" items.</div>
        </div>

        <div class="help-tip">
          <div class="help-tip-title">\uD83D\uDCC5 Schedule Annual Reviews</div>
          <div class="help-tip-text">Set a yearly reminder to review and update your vault. Check for expired documents, changed accounts, new assets, and updated beneficiaries.</div>
        </div>

        <div class="help-tip">
          <div class="help-tip-title">\uD83D\uDD10 Keep Secrets Safe</div>
          <div class="help-tip-text">Store your password manager master password in a sealed envelope in a fireproof safe. This is the key to everything. Never email or text sensitive credentials.</div>
        </div>

        <div class="help-tip">
          <div class="help-tip-title">\uD83D\uDCDD Fill Out the Details</div>
          <div class="help-tip-text">The real value is in the details. Clicking "checkbox" only tracks what you've done - clicking "+ Details" captures the actual information your family needs.</div>
        </div>

        <div class="help-tip">
          <div class="help-tip-title">\uD83D\uDC65 Include Your Partner</div>
          <div class="help-tip-text">Walk through this vault with ${escAttr(settings.partnerName)}. Make sure they know where it is, how to access it, and what to do with the information.</div>
        </div>

        <div class="help-tip">
          <div class="help-tip-title">\u26A0\uFE0F Beneficiaries Override Wills</div>
          <div class="help-tip-text">The beneficiary you name on bank accounts, retirement accounts, and insurance policies will receive those assets regardless of what your will says. Review ALL beneficiary designations!</div>
        </div>

        <div class="help-tip">
          <div class="help-tip-title">\uD83C\uDFE0 Property in Trust = No Probate</div>
          <div class="help-tip-text">Transferring your home into a living trust avoids probate court. This saves time, money, and keeps the transfer private. Consult an estate attorney.</div>
        </div>
      </div>`;
    }

    html += `</div></div></div>`;
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
          <div class="cat-name" style="color:${isActive ? 'white' : '#CBD5E1'}">${escAttr(replacePlaceholders(cat.name))}</div>
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
        <h2 style="font-size:18px;font-weight:800;color:white;margin-bottom:8px">Welcome to your Life Vault, ${escAttr(settings.primaryUserName)}</h2>
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
        const totalItems = cat.folders.reduce((a, f) => a + f.items.length, 0);
        const doneItems = cat.folders.reduce((a, f, fi) =>
          a + f.items.filter((_, ii) => checkedItems[itemKey(cat.id, fi, ii)]).length, 0);
        html += `<div class="dash-card" data-action="select-category" data-cat-id="${cat.id}" data-hover-color="${cat.color}40">
          ${progressRingSVG(prog, 44, 4, cat.color)}
          <div style="flex:1">
            <div style="font-size:13px;font-weight:700;color:white;margin-bottom:2px">${cat.icon} ${escAttr(replacePlaceholders(cat.name))}</div>
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
            <h2 style="font-size:18px;font-weight:800;color:white;margin:0">${escAttr(replacePlaceholders(activeCat.name))}</h2>
            <p style="font-size:12px;color:#94A3B8;margin:4px 0 0">${escAttr(replacePlaceholders(activeCat.description))}</p>
          </div>
          ${progressRingSVG(prog, 56, 5, activeCat.color)}
        </div>
      </div>`;

      // FOLDERS
      activeCat.folders.forEach((folder, fi) => {
        const isOpen = activeFolder === fi;
        const items = filteredFolderItems(folder);
        const doneCount = items.filter(item => checkedItems[itemKey(activeCat.id, fi, item.ii)]).length;
        const foldProg = items.length === 0 ? 0 : (doneCount / items.length) * 100;
        const dotColor = foldProg === 100 ? "#34D399" : foldProg > 0 ? activeCat.color : "rgba(255,255,255,0.15)";
        const dotShadow = foldProg === 100 ? "box-shadow:0 0 8px rgba(52,211,153,0.5)" : "";

        html += `<div class="folder-card${isOpen ? ' open' : ''}">`;
        html += `<button class="folder-btn" data-action="toggle-folder" data-folder-idx="${fi}">
          <div class="dot" style="background:${dotColor};${dotShadow}"></div>
          <span class="folder-name" style="color:${isOpen ? 'white' : '#CBD5E1'}">\uD83D\uDCC1 ${escAttr(replacePlaceholders(folder.name))}</span>
          <span class="folder-count">${doneCount}/${items.length}</span>
          <div class="folder-prog"><div class="folder-prog-fill" style="width:${foldProg}%;background:${foldProg === 100 ? '#34D399' : activeCat.color}"></div></div>
          <span class="arrow">\u25BE</span>
        </button>`;

        html += `<div class="folder-body">`;

        // Instructions
        html += `<div class="inst-box" style="background:${activeCat.color}10;border:1px solid ${activeCat.color}20">
          <div class="inst-label" style="color:${activeCat.color}">Instructions for You</div>
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

    document.getElementById("app").innerHTML = html;

    // Re-focus search input and restore cursor position
    const searchEl = document.getElementById("search-input");
    if (searchEl && searchQuery) {
      searchEl.focus();
      searchEl.setSelectionRange(searchQuery.length, searchQuery.length);
    }
  }

  function renderModal() {
    const { catId, folderIdx, itemIdx, templateType } = modalOpen;
    const tpl = TEMPLATES[templateType];
    if (!tpl) return '';

    const cat = getProcessedCategories().find(c => c.id === catId);
    const folder = cat ? cat.folders[folderIdx] : null;
    const item = folder ? folder.items[itemIdx] : null;
    const tplK = templateKey(catId, folderIdx, itemIdx);
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
      case "help-toggle-category": {
        const catId = el.dataset.catId;
        helpExpandedCategories[catId] = !helpExpandedCategories[catId];
        render();
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
    const { catId, folderIdx, itemIdx, templateType } = modalOpen;
    const tpl = TEMPLATES[templateType];
    if (!tpl) return;

    const tplK = templateKey(catId, folderIdx, itemIdx);
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
    const { catId, folderIdx, itemIdx, templateType } = modalOpen;
    const tpl = TEMPLATES[templateType];
    if (!tpl) return;

    const cat = getProcessedCategories().find(c => c.id === catId);
    const folder = cat ? cat.folders[folderIdx] : null;
    const item = folder ? folder.items[itemIdx] : null;
    const tplK = templateKey(catId, folderIdx, itemIdx);
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
    const { catId, folderIdx, itemIdx, templateType } = modalOpen;
    const tpl = TEMPLATES[templateType];
    if (!tpl) return;

    const cat = getProcessedCategories().find(c => c.id === catId);
    const folder = cat ? cat.folders[folderIdx] : null;
    const item = folder ? folder.items[itemIdx] : null;
    const tplK = templateKey(catId, folderIdx, itemIdx);
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
  <button class="print-btn no-print">🖨️ Print / Save as PDF</button>

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
      exportDate: new Date().toISOString(),
      version: "1.3.0"
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
    reader.onload = function(e) {
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
        alert('Data imported successfully!');
        render();
      } catch (err) {
        alert('Error importing data: ' + err.message);
      }
    };
    reader.readAsText(file);
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
