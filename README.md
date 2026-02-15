# Family Life Vault

A comprehensive Chrome extension for organizing digital legacy, estate planning, and important family documents. Built to ensure your family has everything they need in one place.

## Quick Start

1. Download or clone this repository
2. Open Chrome → `chrome://extensions/`
3. Enable **Developer mode** (top-right toggle)
4. Click **Load unpacked** → Select the `life-vault` folder
5. Click the extension icon to open the vault
6. Complete the **5-step setup wizard** with your family information

---

## Features

### Personalized Setup Wizard

When you first install the extension, a guided setup wizard helps you personalize your vault:

| Step | What You'll Configure |
|------|----------------------|
| 1. Welcome | Introduction to the vault |
| 2. Family Info | Your family name (displayed as vault title) |
| 3. Primary User | Your name |
| 4. Partner | Your partner/spouse name (your next of kin) |
| 5. Children | Add one or more children's names |

All names are dynamically used throughout the app via placeholders, making the experience personal to your family.

### Settings Panel

Access settings anytime via the **gear icon** to:

- Update family member names
- Add or remove children dynamically
- Customize bank account names and types (Checking, Savings, High-Yield, Foreign, Credit Card, Investment)
- Add quick links to important documents (Notion, Google Drive, etc.)
- Export or import your data

### Dynamic Checklist Items

The app automatically generates checklist items based on your settings:

**Dynamic Children Items:**
- If you have multiple children (e.g., "Alice" and "Bob"), items like "{firstChild} birth certificate" automatically expand to:
  - "Alice birth certificate"
  - "Bob birth certificate"
- Works across all categories: birth certificates, passports, SSN cards, medical records, 529 plans, etc.

**Dynamic Bank Account Items:**
- Bank accounts you add in settings automatically appear in the appropriate checklist folders:
  - Checking accounts → "Checking Accounts" folder
  - Savings/HYS accounts → "Savings Accounts" folder
  - Foreign accounts → "International Bank Accounts" folder

### 15 Color-Coded Categories

| Category | Description |
|----------|-------------|
| Identity & Personal Documents | Birth certificates, passports, SSN cards, immigration docs |
| Legal & Estate Planning | Wills, trusts, power of attorney, healthcare directives |
| Financial Accounts | Bank accounts (domestic & international), credit cards, investment accounts |
| Insurance | Life, health, property, and disability insurance |
| Property & Assets | Real estate (domestic & foreign), vehicles, valuables, gold/jewelry |
| Taxes | US and international tax records and professionals |
| Digital Life | Password managers, email, subscriptions, social media |
| Medical & Health | Providers, history, prescriptions, records |
| Family & Childcare | School info, childcare, education plans |
| Employment & Income | Employer details, benefits, side projects |
| Debts & Obligations | Mortgages, loans, recurring payments |
| Home & Utilities | Utility accounts, home maintenance, service providers |
| Emergency Contacts | Key people, attorneys, financial advisors |
| After Death Playbook | First 48 hours, first 30 days action items |
| Legacy & Memories | Funeral wishes, letters, family history |

### Progress Tracking

- **Overall progress ring** showing completion percentage
- **Per-category progress bars** in the sidebar
- **Per-folder progress** showing items completed
- **Visual indicators** (green dots) for fully completed sections

### Priority-Based Filtering

Items are tagged by priority:

- **CRITICAL** (Red) - Must be done immediately
- **IMPORTANT** (Yellow) - Should be done soon
- **OPTIONAL** (Blue) - Nice to have

### 50+ Detailed Templates

Each checklist item can have a detailed form with:

- Document details (numbers, dates, locations)
- Storage information
- After-death instructions for your family
- Contact information and processes

Templates include: birth certificates, passports, foreign travel documents, bank accounts (domestic & foreign), credit cards, investment accounts, retirement accounts, crypto wallets, insurance policies, real property (domestic & foreign), vehicles, valuables, wills, trusts, power of attorney, medical providers, prescriptions, and many more.

### International/Foreign Support

The app includes templates for international assets:

- **Foreign Bank Accounts** - With fields for country, currency, SWIFT/routing codes, repatriation instructions
- **Foreign Property** - With succession process, local contacts, tax implications
- **Foreign Tax Records** - With tax IDs, national IDs, tax treaty information
- **Foreign Travel Documents** - Secondary passports, travel documents

### Instructions for Next of Kin

Each folder includes:
- **Instructions for You** - What you need to do to organize
- **Instructions for [Partner Name] (NOK)** - Expandable section with specific guidance for your next of kin

### Export Options

**Individual Items:**
- Export as Markdown (`.md` file)
- Export as PDF (print-friendly page with Print/Save button)

**Full Backup:**
- JSON export with all checklist states, template data, and settings
- Import function to restore from backup

---

## How to Use

### Working Through Items

1. **Select a category** from the sidebar or dashboard
2. **Expand a folder** by clicking on it
3. **Check off items** as you complete them
4. **Click "+ Details"** to fill in the detailed template
5. **Save your details** - button changes to "✓ Details" when saved

### Filtering & Searching

- Use **filter buttons** (All, Critical, Important, Optional) to focus
- Use the **search box** to find specific items across all categories

### Viewing NOK Instructions

1. Expand any folder
2. Click **"▸ Instructions for [Partner Name] (Next of Kin)"**
3. Read the specific guidance written for your family member

### Managing Settings

1. Click the **⚙ Settings** button in the header
2. Update family names, add/remove children
3. Customize bank accounts with names and types:
   - **Checking** - Regular checking accounts
   - **Savings** - Standard savings accounts
   - **High-Yield Savings** - Online high-yield savings
   - **Foreign Account** - International/overseas bank accounts
   - **Credit Card** - Credit card accounts
   - **Investment** - Brokerage and investment accounts
4. Add quick links to your important documents
5. Click **Save Settings** to apply changes

---

## File Structure

```
life-vault/
├── manifest.json      # Chrome extension configuration (v1.2.0)
├── app.html           # Main application HTML with styles
├── app.js             # Core application logic (~1300 lines)
├── data.js            # Categories, folders, and checklist items
├── templates.js       # 50+ detailed template definitions
├── background.js      # Extension background service worker
├── icons/             # Extension icons (16, 48, 128px)
└── README.md          # This file
```

---

## Data Storage

All data is stored locally using Chrome's `chrome.storage.local` API:

| Key | Purpose |
|-----|---------|
| `lifeorg-checked` | Checklist states |
| `lifeorg-templates` | Template form data |
| `lifeorg-settings` | User settings (names, bank accounts, links) |
| `lifeorg-setup-complete` | Setup wizard completion flag |

**Data never leaves your device unless you export it.**

---

## Customization

### Placeholder System

The app uses these placeholders that get replaced with your settings:

| Placeholder | Replaced With |
|-------------|---------------|
| `{primaryUser}` | Your name |
| `{partner}` | Your partner's name |
| `{firstChild}` | Your first child's name (or each child when expanded) |
| `{children}` | All children's names (comma-separated) |
| `{familyName}` | Your family name |

### Dynamic Item Expansion

Items containing `{firstChild}` are automatically expanded to create one item per child when you have multiple children configured in settings. This happens automatically - no code changes needed.

### Adding New Items

Edit `data.js` to add new items to any folder:

```javascript
{ text: "Your new item description", priority: "critical" }
```

### Adding New Templates

Edit `templates.js` to create new template types with custom fields.

### Adding New Categories

Add a new category object to the `CATEGORIES` array in `data.js`.

---

## Tips for Success

1. **Start with Critical items** - Use the Critical filter to focus on essentials first
2. **Fill templates as you go** - Don't just check boxes; fill in the details
3. **Export regularly** - Create JSON backups monthly
4. **Share with your NOK** - Walk through the vault with your family member
5. **Review annually** - Update expired documents, changed accounts, etc.
6. **Add Quick Links** - Link to your existing Notion pages or Google Drive folders
7. **Configure bank accounts** - Add all your accounts in settings for dynamic checklist items

---

## Privacy & Security

- All data stored locally on your device
- No external servers or cloud sync
- No analytics or tracking
- Export files should be stored securely
- Consider encrypting exported backups

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Data not saving | Check storage permissions; reload extension from `chrome://extensions/` |
| Export not working | Allow pop-ups for the extension; check download permissions |
| Extension not loading | Ensure all files are present; check console (`F12`) for JavaScript errors |
| Want to reset | Remove extension from `chrome://extensions/`, clear site data, reload |
| Children items not expanding | Ensure you have multiple children added in Settings |
| Bank accounts not appearing | Check that bank account types match the folder (checking/savings/foreign) |

---

## Version History

| Version | Changes |
|---------|---------|
| **v1.2.0** | Dynamic children items (auto-expand for multiple children), dynamic bank account items, foreign/international templates (bank, property, tax), foreign travel document support |
| **v1.1.0** | Generic release with setup wizard, settings panel, placeholder system, multiple children support, configurable bank accounts, quick links |
| **v1.0.0** | Initial release with 15 categories, 50+ templates, and full export functionality |

---

## Credits

Inspired by [Nokbox](https://nokbox.com/) and comprehensive estate planning best practices.

---

*"Everything your family needs, in one place."*
