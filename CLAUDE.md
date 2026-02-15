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
          { id: "fullName", label: "Full Name", type: "text", hint: "..." },
          { id: "notes", label: "Notes", type: "textarea" }
        ]
      }
    ]
  }
};
```

#### `app.js` - State Management
```javascript
// Storage keys
const STORAGE_KEYS = {
  checked: "lifeorg-checked",        // { "catId-folderIdx-itemIdx": true }
  templates: "lifeorg-templates",     // { "tpl-catId-fi-ii": { fieldId: value } }
  settings: "lifeorg-settings",       // User settings object
  setupComplete: "lifeorg-setup-complete",  // boolean
  theme: "lifeorg-theme"              // "light" | "dark"
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

### Modal Pattern

```javascript
// Open modal
modalOpen = { catId, folderIdx, itemIdx, templateType };
render();

// Close modal
modalOpen = null;
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
