# Life Vault - LLM Context Guide

This file provides context for Claude and other LLMs to understand and work with the Life Vault Chrome extension codebase.

## Project Overview

**Life Vault** is a Chrome extension for organizing digital legacy, estate planning, and important family documents. It's a single-page application (SPA) built with vanilla JavaScript, designed to run entirely client-side with data stored in `chrome.storage.local`.

### Key Characteristics

- **No framework dependencies** - Pure vanilla JavaScript, HTML, CSS
- **CSP compliant** - No inline event handlers; all events use delegated listeners
- **Chrome Extension** - Uses Manifest V3 with service worker
- **Local-only storage** - All data stays on device via `chrome.storage.local`
- **Glassmorphism UI** - Modern frosted glass design with light/dark themes

## Architecture

### File Structure

```
life-vault/
├── manifest.json      # Chrome extension manifest (v3)
├── app.html           # Single HTML file with embedded CSS
├── app.js             # Main application logic (IIFE pattern)
├── data.js            # CATEGORIES array with folders and items
├── templates.js       # TEMPLATES object with form definitions
├── background.js      # Service worker (minimal)
└── icons/             # SVG icons (16, 48, 128px)
```

### Core Data Structures

#### `data.js` - CATEGORIES Array
```javascript
const CATEGORIES = [
  {
    id: "identity",           // Unique identifier
    name: "Identity & Docs",  // Display name (supports placeholders)
    icon: "🪪",               // Emoji icon
    color: "#6366F1",         // Theme color (hex)
    description: "...",       // Category description
    folders: [
      {
        name: "Birth Certificates",
        templateType: "birth-certificate",  // Links to TEMPLATES key
        instructions: "...",                 // User instructions
        nokInstructions: "...",              // Next-of-kin instructions
        existingLinks: [{ label, url }],     // Optional preset links
        items: [
          { text: "...", priority: "critical" | "important" | "optional" }
        ]
      }
    ]
  }
];
```

#### `templates.js` - TEMPLATES Object
```javascript
const TEMPLATES = {
  "birth-certificate": {
    title: "Birth Certificate Details",
    icon: "📜",
    sections: [
      {
        title: "Document Information",
        fields: [
          { id: "fullName", label: "Full Name", type: "input", hint: "..." },
          { id: "notes", label: "Notes", type: "textarea" },
          { id: "digital_scan_url", label: "Where is the digital scan stored?", type: "url", hint: "Link to cloud storage" }
        ]
      }
    ]
  }
};
```

#### Field Types
| Type | Renders As | Description |
|------|------------|-------------|
| `input` | Text input | Standard single-line text field |
| `textarea` | Textarea | Multi-line text field |
| `url` | URL input with link display | Shows clickable link when saved, edit button to modify |

#### `app.js` - State Management
```javascript
// Storage keys
const STORAGE_KEYS = {
  checked: "lifeorg-checked",        // { "catId-folderIdx-itemIdx": true }
  templates: "lifeorg-templates",     // { "tpl-catId-fi-ii": { fieldId: value } }
  settings: "lifeorg-settings",       // User settings object
  setupComplete: "lifeorg-setup-complete",  // boolean
  theme: "lifeorg-theme",             // "light" | "dark"
  customItems: "lifeorg-custom-items" // { "catId-folderIdx": [{ id, text, priority, createdAt }] }
};

// Settings structure
const DEFAULT_SETTINGS = {
  familyName: "My Family",
  primaryUserName: "Primary User",
  partnerName: "Partner",
  children: ["Child"],
  bankAccounts: [{ name: "...", type: "checking" | "savings" | "hys" | "foreign" | "credit" | "investment" }],
  quickLinks: [{ label: "...", url: "..." }],
  theme: "dark"
};
```

## Key Patterns

### 1. Placeholder System

Text in `data.js` and `templates.js` can contain placeholders replaced at render time:

| Placeholder | Replaced With |
|-------------|---------------|
| `{familyName}` | `settings.familyName` |
| `{primaryUser}` | `settings.primaryUserName` |
| `{partner}` | `settings.partnerName` |
| `{firstChild}` | First child's name (or each child when expanded) |
| `{children}` | Comma-separated list of all children |

### 2. Dynamic Item Expansion

Items containing `{firstChild}` are automatically duplicated for each child:
```javascript
// If settings.children = ["Alice", "Bob"]
// Item: "{firstChild} birth certificate"
// Becomes: "Alice birth certificate", "Bob birth certificate"
```

Bank accounts from settings are also dynamically expanded into relevant folders:
| Account Type | Folder | Item Format |
|--------------|--------|-------------|
| `checking` | Checking Accounts | `{name} — document account #, routing #, login` |
| `savings`, `hys` | Savings Accounts | `{name} — balance & login` |
| `foreign` | International Bank Accounts | `{name} — account #, branch, routing code` |
| `investment` | Brokerage & Investment Accounts | `{name} — account #, login, beneficiaries` |
| `credit` | Credit Cards | `{name} — card #, login, autopay status` |

### 3. Event Delegation Pattern

All events use `data-action` attributes with delegated listeners:
```javascript
// In render():
html += `<button data-action="toggle-theme">Theme</button>`;

// In event listener:
document.getElementById("app").addEventListener("click", (e) => {
  const action = e.target.closest("[data-action]")?.dataset.action;
  if (action) handleAction(action, el);
});
```

### 4. Action Handler Pattern

All UI interactions flow through `handleAction(action, element)`:
```javascript
function handleAction(action, el) {
  switch (action) {
    case "toggle-theme":
      applyTheme(currentTheme === "dark" ? "light" : "dark");
      render();
      break;
    // ... more cases
  }
}
```

### 5. Render-on-Change Pattern

State changes always call `render()` to rebuild the entire UI:
```javascript
function render() {
  let html = "";
  // Build complete HTML string
  document.getElementById("app").innerHTML = html;
}
```

### 6. Custom Items System

Users can add custom checklist items to any folder with their own priority and details:

```javascript
// Custom item structure stored per folder
customItems = {
  "catId-folderIdx": [
    { id: "unique-id", text: "Custom item description", priority: "critical", createdAt: timestamp }
  ]
};

// Helper functions for custom items
function customItemKey(catId, fi, itemId) { return `custom-${catId}-${fi}-${itemId}`; }
function customTemplateKey(catId, fi, itemId) { return `tpl-custom-${catId}-${fi}-${itemId}`; }
function folderKey(catId, fi) { return `${catId}-${fi}`; }
function getCustomItemsForFolder(catId, fi) { return customItems[folderKey(catId, fi)] || []; }
```

Custom items:
- Are visually distinguished with a left border accent
- Support all three priority levels (critical, important, optional)
- Have their own details template (`custom_item` in TEMPLATES)
- Can be deleted by the user
- Are included in progress calculations and statistics
- Are included in export/import functionality

### 7. URL Field System

URL fields provide a special input type for storing links to digital document scans:

```javascript
// State for tracking which URL fields are in edit mode
let urlFieldsInEditMode = {}; // { "field-{fieldId}": true }

// Field definition in templates.js
{ id: "digital_scan_url", label: "Where is the digital scan stored?", type: "url", hint: "..." }
```

URL field behavior:
- **Empty/Edit mode**: Shows standard URL input field
- **Has value**: Displays as clickable link with "Open" and "Edit" buttons
- **Open button**: Opens document in new tab (`target="_blank"`)
- **Edit button**: Toggles field back to edit mode via `edit-url-field` action
- **PDF export**: URLs render as clickable links with full URL shown in print mode

## Theming System

### CSS Variables

Themes use CSS custom properties defined in `:root` and `[data-theme="light"]`:

```css
:root {
  /* Dark theme (default) */
  --bg-primary: linear-gradient(...);
  --text-primary: #F8FAFC;
  --accent-primary: #6366F1;
  --glass-blur: blur(20px);
  /* ... */
}

[data-theme="light"] {
  /* Light theme overrides */
  --bg-primary: linear-gradient(...);
  --text-primary: #0F172A;
  /* ... */
}
```

### Theme Application

```javascript
function applyTheme(theme) {
  currentTheme = theme;
  document.documentElement.setAttribute("data-theme", theme);
  saveData(STORAGE_KEYS.theme, theme);
}
```

## Common Tasks

### Adding a New Category

1. Add entry to `CATEGORIES` array in `data.js`
2. Include required fields: `id`, `name`, `icon`, `color`, `description`, `folders`
3. Each folder needs: `name`, `templateType`, `instructions`, `nokInstructions`, `items`

### Adding a New Template

1. Add entry to `TEMPLATES` object in `templates.js`
2. Reference it via `templateType` in folder definitions
3. Include `title`, `icon`, `sections` with `fields`

### Adding a New Action

1. Add `data-action="your-action"` to HTML in render function
2. Add case to `handleAction()` switch statement
3. Call `render()` if UI needs updating

### Adding a New Setting

1. Add to `DEFAULT_SETTINGS` in `app.js`
2. Add UI in `renderSettingsModal()`
3. Handle saving in `saveSettingsFromModal()`
4. Use via `settings.yourSetting` in render functions

### Adding a New Storage Key

1. Add to `STORAGE_KEYS` object
2. Add to `chrome.storage.local.get()` call in initialization
3. Use `saveData(STORAGE_KEYS.yourKey, data)` to persist

### Custom Items Feature

Users can add custom checklist items via the "+ Add Custom Item" button at the bottom of each folder body. The system handles:

1. **Adding custom items** - Opens `customItemModalOpen` modal with text input and priority selector
2. **Saving custom items** - Stores in `customItems` object keyed by `folderKey(catId, fi)`
3. **Displaying custom items** - Rendered after regular items with `.custom-item` class (left border accent)
4. **Custom item details** - Uses `custom_item` template with fields for description, location, contacts, instructions
5. **Deleting custom items** - Also removes associated template data and checked status
6. **Progress tracking** - Custom items are included in all progress calculations

## UI Components

### Glassmorphism Elements

Key CSS classes for glass effect:
- `backdrop-filter: var(--glass-blur) var(--glass-saturate)`
- `background: var(--bg-glass)` or `var(--bg-secondary)`
- `border: 1px solid var(--border-subtle)`
- `box-shadow: var(--shadow-glass)`

### Button Styles

| Class | Purpose |
|-------|---------|
| `.save-btn` | Primary gradient button |
| `.export-btn` | Secondary green button |
| `.settings-btn` | Header action button |
| `.theme-toggle` | Theme switch button |
| `.filter-btn` | Priority filter pills |
| `.add-custom-item-btn` | Dashed border button to add custom items |
| `.delete-custom-btn` | Red × button to delete custom items |
| `.priority-chip` | Priority selector chips in custom item modal |
| `.url-field-wrapper` | Container for URL field (input or link display) |
| `.url-link-display` | Container showing saved URL as clickable link |
| `.url-link` | Clickable link text (truncated with ellipsis) |
| `.url-edit-btn` | Pencil button to edit URL |
| `.url-open-btn` | External link button to open document |

### Modal Pattern

```javascript
// Open regular item modal
modalOpen = { catId, folderIdx, itemIdx, templateType };
render();

// Open custom item modal (for details)
modalOpen = { catId, folderIdx, customItemId, templateType: "custom_item", isCustom: true };
render();

// Open add custom item modal
customItemModalOpen = { catId, folderIdx };
render();

// Close modal
modalOpen = null;
customItemModalOpen = null;
render();
```

## Priority System

Items have three priority levels defined in `data.js` via `PRIORITY_COLORS`:

| Priority | Color | Label |
|----------|-------|-------|
| `critical` | Red (#EF4444) | CRITICAL |
| `important` | Yellow (#FBBF24) | IMPORTANT |
| `optional` | Blue (#3B82F6) | OPTIONAL |

## Testing Considerations

- Test theme switching in both directions
- Test with multiple children configured
- Test export/import JSON roundtrip
- Test all template types save correctly
- Test search functionality across categories
- Test custom item creation with all priority levels
- Test custom item details template saves correctly
- Test custom item deletion removes associated data
- Test custom items are included in progress calculations
- Test custom items persist across sessions
- Test custom items are included in export/import
- Test dynamic investment accounts appear in Brokerage & Investment Accounts folder
- Test dynamic credit cards appear in Credit Cards folder
- Test PDF export button styling in light mode
- Test URL field displays as input when empty
- Test URL field shows clickable link after saving
- Test URL edit button toggles back to input mode
- Test URL open button opens link in new tab
- Test URL fields render as clickable links in PDF export

## Performance Notes

- Full re-render on each state change (acceptable for app size)
- Template data is lazy-loaded per item
- Category processing is cached via `processedCategories`
- Search uses debounced input (200ms)

## Browser Compatibility

- Requires Chrome (uses `chrome.storage.local` API)
- Uses modern CSS (CSS variables, backdrop-filter)
- Uses ES6+ JavaScript (arrow functions, template literals, destructuring)

## Security Considerations

- No external network requests
- No eval() or dynamic code execution
- All user input escaped via `escAttr()` helper
- CSP-compliant (no inline handlers)
- Data stays local unless explicitly exported
