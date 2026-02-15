// Family Life Vault — Enhanced Data with Granular Checklists
// 15 Categories aligned with Digital Legacy System Checklist + Nokbox
// Uses placeholders: {primaryUser}, {partner}, {firstChild}, {children}, {familyName}

const PRIORITY_COLORS = {
  critical: { bg: "#FEE2E2", text: "#991B1B", label: "CRITICAL", dot: "#DC2626" },
  important: { bg: "#FEF3C7", text: "#92400E", label: "IMPORTANT", dot: "#D97706" },
  optional: { bg: "#DBEAFE", text: "#1E40AF", label: "OPTIONAL", dot: "#2563EB" },
};

const CATEGORIES = [
  {
    id: "identity",
    name: "Identity & Personal Documents",
    icon: "\u{1FAAA}",
    color: "#DC2626",
    description: "Birth certificates, passports, Social Security cards, marriage certificate, citizenship, and immigration documents for {primaryUser}, {partner}, and {children}.",
    folders: [
      {
        name: "Birth Certificates",
        templateType: "birth_certificate",
        items: [
          { text: "{primaryUser} birth certificate (original + certified copy)", priority: "critical" },
          { text: "{partner} birth certificate (original + certified copy)", priority: "critical" },
          { text: "{firstChild} birth certificate (original + certified copy)", priority: "critical" },
          { text: "Store originals in fireproof safe", priority: "critical" },
          { text: "Order extra certified copies from vital records office", priority: "important" },
          { text: "Scan and upload digital copies to secure cloud storage", priority: "important" },
          { text: "Additional children birth certificates", priority: "optional" },
        ],
        instructions: "Store originals in fireproof safe. Keep certified copies in this folder. Order extra certified copies from the vital records office.",
        nokInstructions: "{partner}: These are needed for insurance claims, legal proceedings, and benefits applications. Keep originals in safe at all times."
      },
      {
        name: "Passports & Visas",
        templateType: "passport",
        items: [
          { text: "{primaryUser} passport (check expiry)", priority: "critical" },
          { text: "{primaryUser} secondary passport / foreign travel document (if applicable)", priority: "critical" },
          { text: "{partner} passport (check expiry)", priority: "critical" },
          { text: "{partner} secondary passport / foreign travel document (if applicable)", priority: "critical" },
          { text: "{firstChild} passport", priority: "critical" },
          { text: "{firstChild} secondary travel documents (if applicable)", priority: "important" },
          { text: "Note all passport numbers and expiration dates", priority: "important" },
          { text: "Note renewal deadlines and set calendar reminders", priority: "important" },
          { text: "Scan color copies and upload to secure storage", priority: "important" },
          { text: "Store in zippered document protector inside safe", priority: "important" },
        ],
        instructions: "Keep in zippered document protector bag inside safe. Scan color copies and upload to secure cloud storage.",
        nokInstructions: "{partner}: Check expiration dates. Adult passports renew every 10 years. Children's passports renew every 5 years."
      },
      {
        name: "Social Security Cards",
        templateType: "ssn_card",
        items: [
          { text: "{primaryUser} SSN card (store securely)", priority: "critical" },
          { text: "{partner} SSN card", priority: "critical" },
          { text: "{firstChild} SSN card", priority: "critical" },
          { text: "Note SSN numbers in encrypted password manager", priority: "important" },
          { text: "NEVER carry SSN cards in wallet", priority: "critical" },
        ],
        instructions: "NEVER carry these in wallet. Store in safe. Note numbers securely in password manager.",
        nokInstructions: "{partner}: SSN is needed for death certificates, insurance claims, tax filings, and bank account transfers. Guard these carefully."
      },
      {
        name: "Marriage & Immigration",
        templateType: "immigration_doc",
        items: [
          { text: "Marriage certificate (original + copies)", priority: "critical" },
          { text: "Green card / immigration documents (if applicable)", priority: "critical" },
          { text: "Naturalization certificate (if applicable)", priority: "important" },
          { text: "I-94 records printed from CBP website", priority: "optional" },
          { text: "Employment authorization documents", priority: "important" },
          { text: "Keep immigration documents together in one section", priority: "important" },
          { text: "Consult immigration attorney re: dependent status if primary dies", priority: "critical" },
        ],
        instructions: "Keep immigration documents together. These are critical for proving legal status and for any benefits claims.",
        nokInstructions: "{partner}: If {primaryUser} passes, immigration status for dependents may be affected. Consult immigration attorney immediately."
      },
      {
        name: "Driver Licenses & State IDs",
        templateType: "drivers_license",
        items: [
          { text: "{primaryUser} driver license (note expiry)", priority: "important" },
          { text: "{partner} driver license (note expiry)", priority: "important" },
          { text: "REAL ID compliant status verified", priority: "important" },
          { text: "International driving permits (if needed)", priority: "optional" },
        ],
        instructions: "Driver licenses renew every few years depending on your state. REAL ID needed for domestic flights.",
        nokInstructions: "{partner}: Your driver license is your primary photo ID. Keep it current."
      }
    ]
  },
  {
    id: "legal",
    name: "Legal & Estate Planning",
    icon: "\u2696\uFE0F",
    color: "#7C3AED",
    description: "Will, living trust, power of attorney, healthcare directives, guardianship, and beneficiary designations.",
    folders: [
      {
        name: "Will & Testament",
        templateType: "will",
        items: [
          { text: "Draft and sign a legally binding will", priority: "critical" },
          { text: "Name executor ({partner} as primary)", priority: "critical" },
          { text: "Name backup executor (trusted family member or friend)", priority: "important" },
          { text: "Specify asset distribution wishes", priority: "critical" },
          { text: "Address any international property inheritance", priority: "important" },
          { text: "Include charitable donation instructions", priority: "optional" },
          { text: "Store original with attorney, copy in safe", priority: "critical" },
          { text: "Review and update will annually or after major life event", priority: "important" },
          { text: "Ensure will is notarized and witnessed per state law", priority: "critical" },
          { text: "Document attorney name, phone, and address", priority: "critical" },
        ],
        instructions: "Schedule consultation with estate attorney. Review will after major life events (births, marriages, property purchases).",
        nokInstructions: "{partner}: Contact the estate attorney listed here. The will must go through probate. Executor handles all asset distribution."
      },
      {
        name: "Living Trust",
        templateType: "trust",
        items: [
          { text: "Create a revocable living trust", priority: "critical" },
          { text: "Transfer real property (home) into the trust", priority: "critical" },
          { text: "Name trustee ({primaryUser}) and successor trustee ({partner})", priority: "critical" },
          { text: "Transfer investment accounts to trust", priority: "important" },
          { text: "Transfer bank accounts to trust where applicable", priority: "important" },
          { text: "Organize the Trust Bag with all documents", priority: "important" },
          { text: "Create Pour-Over Will to catch assets not in trust", priority: "important" },
          { text: "Review trust terms annually", priority: "important" },
        ],
        instructions: "A living trust avoids probate and keeps asset transfer private. Especially important for real property.",
        nokInstructions: "{partner}: A living trust means assets transfer automatically without court involvement. Contact the successor trustee."
      },
      {
        name: "Power of Attorney",
        templateType: "poa",
        items: [
          { text: "Durable Power of Attorney for financial decisions", priority: "critical" },
          { text: "Healthcare Power of Attorney / Proxy", priority: "critical" },
          { text: "{partner}'s POA designating {primaryUser}", priority: "important" },
          { text: "Specify POA for international assets (if applicable)", priority: "important" },
          { text: "Ensure POA is state-compliant and notarized", priority: "critical" },
          { text: "Distribute copies to relevant financial institutions", priority: "important" },
        ],
        instructions: "POA allows someone to make decisions on your behalf if incapacitated. This is DIFFERENT from a will (which only applies after death).",
        nokInstructions: "{partner}: If {primaryUser} is incapacitated but alive, use the financial POA to manage accounts. Healthcare POA for medical decisions."
      },
      {
        name: "Guardianship for {firstChild}",
        templateType: "guardianship",
        items: [
          { text: "Designate legal guardian for {firstChild} if both parents die", priority: "critical" },
          { text: "Designate backup guardian", priority: "critical" },
          { text: "Write letter of wishes for children's upbringing", priority: "important" },
          { text: "Discuss with chosen guardians and get their agreement", priority: "critical" },
          { text: "Include provisions for additional children", priority: "important" },
          { text: "Document guardian's contact information", priority: "critical" },
          { text: "Specify financial provisions for guardian (from trust)", priority: "important" },
          { text: "Document educational and cultural wishes", priority: "important" },
        ],
        instructions: "This is the most critical decision for parents. Choose someone who shares your values for raising your children.",
        nokInstructions: "{partner}: If both of us are gone, the named guardian takes custody. Court will verify. All financial provisions are in the trust."
      },
      {
        name: "Healthcare Directives",
        templateType: "healthcare_directive",
        items: [
          { text: "Advance healthcare directive / Living will", priority: "critical" },
          { text: "DNR preferences documented", priority: "important" },
          { text: "Organ donation preferences registered (DMV + registry)", priority: "important" },
          { text: "HIPAA release form (allows {partner} access to medical records)", priority: "important" },
          { text: "State statutory form completed and notarized", priority: "critical" },
          { text: "Give copies to primary care physician", priority: "important" },
          { text: "{partner}'s healthcare directive also completed", priority: "important" },
        ],
        instructions: "Your state may require specific forms for advance directives. Can often be done without an attorney.",
        nokInstructions: "{partner}: Present the healthcare directive to the hospital if {primaryUser} is incapacitated. This guides life-support and treatment decisions."
      },
      {
        name: "Beneficiary Designations Master List",
        templateType: "beneficiary_master",
        items: [
          { text: "Review ALL account beneficiary designations", priority: "critical" },
          { text: "Ensure beneficiary matches will/trust intentions", priority: "critical" },
          { text: "List every account with its current beneficiary", priority: "critical" },
          { text: "Note: beneficiary designation OVERRIDES the will", priority: "critical" },
          { text: "Update after marriage, birth, or divorce", priority: "important" },
          { text: "Set contingent (backup) beneficiaries on all accounts", priority: "important" },
        ],
        instructions: "Beneficiary designations on accounts override your will. This is the #1 mistake people make. Review them ALL.",
        nokInstructions: "{partner}: Accounts with you as beneficiary transfer directly to you with a death certificate. No probate needed."
      }
    ]
  },
  {
    id: "financial",
    name: "Financial Accounts & Banking",
    icon: "\u{1F3E6}",
    color: "#059669",
    description: "All bank accounts, checking, savings, high-yield, and international accounts with login details and auto-pay info.",
    folders: [
      {
        name: "Checking Accounts",
        templateType: "bank_account",
        items: [
          { text: "{primaryUser} Primary Checking — document account #, routing #, login", priority: "critical" },
          { text: "{primaryUser} Secondary Checking (if any) — document details", priority: "critical" },
          { text: "{partner} Checking — document account #, routing #, login", priority: "critical" },
          { text: "List all auto-pay bills linked to each checking account", priority: "important" },
          { text: "Note which account pays mortgage/rent", priority: "important" },
          { text: "Note which account pays utilities", priority: "important" },
          { text: "Note which account pays insurance premiums", priority: "important" },
          { text: "Set up joint account access for {partner} on all accounts", priority: "critical" },
          { text: "Document online banking URLs for each bank", priority: "important" },
        ],
        instructions: "Document which bills auto-pay from which account. This is crucial for keeping bills paid if you're not available.",
        nokInstructions: "{partner}: Keep these accounts active. Mortgage, utilities, and subscriptions auto-pay from here. Don't close until all auto-pays are redirected."
      },
      {
        name: "Savings Accounts",
        templateType: "bank_account",
        items: [
          { text: "{primaryUser} High-Yield Savings — balance & login", priority: "critical" },
          { text: "{partner} High-Yield Savings — emergency cash reserve", priority: "critical" },
          { text: "Additional savings accounts", priority: "important" },
          { text: "Emergency fund account", priority: "important" },
          { text: "Document current interest rates on each account", priority: "optional" },
          { text: "Note minimum balance requirements", priority: "optional" },
        ],
        instructions: "High-yield savings accounts are your emergency fund. {partner} should have direct access at all times.",
        nokInstructions: "{partner}: High-yield savings accounts are immediately accessible online. These are your emergency funds."
      },
      {
        name: "International Bank Accounts",
        templateType: "foreign_bank_account",
        items: [
          { text: "{primaryUser} International Savings — account #, branch, routing code", priority: "important" },
          { text: "{primaryUser} Fixed Deposits (if any)", priority: "important" },
          { text: "Joint International Account — {partner} as joint holder", priority: "important" },
          { text: "{partner} International Savings", priority: "important" },
          { text: "Document account type classifications (NRE/NRO if applicable)", priority: "important" },
          { text: "Nominate {partner} on all international accounts", priority: "critical" },
          { text: "Plan to close/consolidate unused accounts", priority: "optional" },
        ],
        instructions: "International accounts may require different procedures. Keep account classifications clear. Nominate {partner} on all accounts.",
        nokInstructions: "{partner}: International bank accounts require death certificate (may need apostille), succession certificate, and nominee claim forms. Contact local family for help."
      },
      {
        name: "Credit Cards",
        templateType: "credit_card",
        items: [
          { text: "List ALL active credit cards with last 4 digits", priority: "critical" },
          { text: "Document which card is used for which recurring charges", priority: "important" },
          { text: "Note credit limits and current balances", priority: "important" },
          { text: "Document reward points balances", priority: "optional" },
          { text: "Note authorized users on each card", priority: "important" },
          { text: "Set up auto-pay for minimum payment on all cards", priority: "important" },
          { text: "Document how to redeem reward points", priority: "optional" },
        ],
        instructions: "Keep credit cards paid off monthly. Document all recurring charges so they can be transferred if a card is cancelled.",
        nokInstructions: "{partner}: Notify credit card companies with death certificate. Authorized user cards stop working. Transfer recurring charges to your own cards."
      }
    ]
  },
  {
    id: "investments",
    name: "Investments & Retirement",
    icon: "\u{1F4C8}",
    color: "#0891B2",
    description: "Brokerage accounts, retirement funds, 401(k), Roth IRA, 529 plans, stock grants, and crypto.",
    folders: [
      {
        name: "Brokerage & Investment Accounts",
        templateType: "investment_account",
        items: [
          { text: "Joint Investment Account — login, account #", priority: "critical" },
          { text: "{primaryUser} Individual Brokerage Account", priority: "important" },
          { text: "{partner} Individual Brokerage Account", priority: "important" },
          { text: "Document beneficiaries on ALL accounts", priority: "critical" },
          { text: "Note approximate current values", priority: "important" },
          { text: "Document investment strategy for each account", priority: "optional" },
          { text: "List any pending limit orders or recurring investments", priority: "optional" },
        ],
        instructions: "Ensure {partner} is named beneficiary on every account. Beneficiary designation overrides the will.",
        nokInstructions: "{partner}: Contact each brokerage with death certificate. Beneficiary accounts transfer directly. Non-beneficiary accounts go through estate."
      },
      {
        name: "Retirement Accounts",
        templateType: "retirement_account",
        items: [
          { text: "{primaryUser} 401(k) — employer plan, login", priority: "critical" },
          { text: "Note 401(k) loan balance and repayment terms", priority: "critical" },
          { text: "{primaryUser} Roth IRA", priority: "critical" },
          { text: "{primaryUser} Traditional IRA", priority: "important" },
          { text: "{partner} Roth IRA", priority: "critical" },
          { text: "{partner} 401(k) / Rollover IRA", priority: "important" },
          { text: "International retirement accounts (PPF, etc.)", priority: "important" },
          { text: "Ensure all accounts have {partner} as primary beneficiary", priority: "critical" },
          { text: "Document current contribution amounts", priority: "important" },
        ],
        instructions: "401(k) loan: if you die, outstanding loan becomes taxable distribution. Document current balance. International retirement accounts may have separate nomination processes.",
        nokInstructions: "{partner}: 401(k) loan balance is deducted from death benefit. Roth IRA is tax-free for beneficiary. International retirement claims require local documentation."
      },
      {
        name: "Employer Stock & RSUs",
        templateType: "rsu_stock",
        items: [
          { text: "Employer stock plan account — vested shares, RSU schedule", priority: "critical" },
          { text: "Document unvested RSU schedule and vesting dates", priority: "important" },
          { text: "Track performance of unsold stocks", priority: "important" },
          { text: "Note cost basis for tax purposes", priority: "important" },
          { text: "ESPP enrollment and contribution details", priority: "optional" },
          { text: "Document employer bereavement equity policy", priority: "important" },
          { text: "Note any trading plan details", priority: "optional" },
        ],
        instructions: "Unvested RSUs may be forfeited upon death — check company policy.",
        nokInstructions: "{partner}: Contact employer HR and stock plan administrator. Vested shares transfer. Unvested RSUs follow company bereavement policy."
      },
      {
        name: "HSA & Benefits Accounts",
        templateType: "hsa_fsa",
        items: [
          { text: "HSA — cash balance", priority: "important" },
          { text: "HSA — investment balance", priority: "important" },
          { text: "Dependent Care FSA balance and deadline", priority: "important" },
          { text: "Medical FSA balance and deadline", priority: "important" },
          { text: "Note: FSA funds expire — use by deadline!", priority: "critical" },
          { text: "Submit ALL pending medical receipts for reimbursement", priority: "important" },
          { text: "Document HSA beneficiary (should be {partner})", priority: "critical" },
        ],
        instructions: "HSA transfers to spouse tax-free. FSA has 'use it or lose it' deadlines. File claims for any outstanding medical expenses ASAP.",
        nokInstructions: "{partner}: HSA becomes yours tax-free as spouse. FSA funds must be claimed before the deadline or they're lost."
      },
      {
        name: "Education Savings (529)",
        templateType: "education_529",
        items: [
          { text: "{firstChild}'s 529 Plan — account details, login", priority: "critical" },
          { text: "Name successor owner ({partner})", priority: "critical" },
          { text: "Document contribution target", priority: "important" },
          { text: "Note current balance and investment allocation", priority: "important" },
          { text: "Document auto-contribution schedule", priority: "important" },
          { text: "Note beneficiary change process for additional children", priority: "optional" },
        ],
        instructions: "529 transfers to successor owner automatically. Funds can only be used for qualified education expenses tax-free.",
        nokInstructions: "{partner}: 529 transfers to you as successor. Funds are for {firstChild}'s education."
      },
      {
        name: "Cryptocurrency & Alternative Assets",
        templateType: "crypto_account",
        items: [
          { text: "List all crypto wallets and exchanges", priority: "important" },
          { text: "Document wallet addresses and recovery phrases", priority: "critical" },
          { text: "Store seed phrases in fireproof safe (NEVER digital)", priority: "critical" },
          { text: "Note approximate holdings and values", priority: "important" },
          { text: "Document how to access and liquidate", priority: "important" },
        ],
        instructions: "Crypto is lost forever if recovery phrases are lost. Store seed phrases physically in the safe. NEVER email or text them.",
        nokInstructions: "{partner}: Crypto recovery phrases are in the safe. Without them, funds are unrecoverable. Get help from a tech-savvy trusted person."
      }
    ]
  },
  {
    id: "insurance",
    name: "Insurance Policies",
    icon: "\u{1F6E1}\uFE0F",
    color: "#D97706",
    description: "Life, health, home, auto, umbrella, and international insurance policies with claim procedures.",
    folders: [
      {
        name: "Life Insurance",
        templateType: "life_insurance",
        items: [
          { text: "Employer group life insurance — policy #, benefit amount", priority: "critical" },
          { text: "Supplemental life insurance (if any)", priority: "important" },
          { text: "{partner} confirmed as primary beneficiary", priority: "critical" },
          { text: "{firstChild} as contingent beneficiary", priority: "important" },
          { text: "Personal life insurance policies", priority: "important" },
          { text: "{partner}'s life insurance policy", priority: "important" },
          { text: "Document claim process for employer insurance", priority: "critical" },
          { text: "Document claim process for personal policies", priority: "critical" },
          { text: "Note premium payment schedule", priority: "important" },
        ],
        instructions: "Life insurance claims require death certificate, policy bond, claimant's ID, and claim form. Employer claims go through HR.",
        nokInstructions: "{partner}: For employer life insurance, contact HR. For personal policies, call the insurance company claims department with policy numbers listed here."
      },
      {
        name: "Health Insurance",
        templateType: "health_insurance",
        items: [
          { text: "Health insurance plan — ID numbers, group #", priority: "critical" },
          { text: "List all covered family members", priority: "important" },
          { text: "COBRA continuation rights documented", priority: "critical" },
          { text: "COBRA has 60-day election deadline — DO NOT MISS", priority: "critical" },
          { text: "Dental insurance details", priority: "important" },
          { text: "Vision insurance details", priority: "important" },
          { text: "Document monthly premium costs for COBRA", priority: "important" },
          { text: "Research marketplace alternatives to COBRA", priority: "optional" },
        ],
        instructions: "If you lose employer coverage, COBRA allows continuation for 18 months (36 for dependents after death).",
        nokInstructions: "{partner}: If {primaryUser} passes, you have 60 DAYS to elect COBRA continuation. Don't miss this deadline."
      },
      {
        name: "Home & Auto Insurance",
        templateType: "property_insurance",
        items: [
          { text: "Homeowner's insurance — policy #, agent contact", priority: "important" },
          { text: "Auto insurance — policy #, agent", priority: "important" },
          { text: "Umbrella liability policy (if any)", priority: "optional" },
          { text: "Additional coverage (earthquake, flood, etc.)", priority: "optional" },
          { text: "Renter's insurance on rental property (if applicable)", priority: "optional" },
          { text: "Document annual premium amounts and due dates", priority: "important" },
          { text: "Note deductible amounts for each policy", priority: "important" },
        ],
        instructions: "Keep insurance current. Review coverage annually.",
        nokInstructions: "{partner}: Keep these policies active. Contact agents for any title/ownership changes needed."
      },
      {
        name: "Disability & Long-Term Care",
        templateType: "disability_insurance",
        items: [
          { text: "Employer short-term disability coverage details", priority: "important" },
          { text: "Employer long-term disability coverage details", priority: "important" },
          { text: "State Disability Insurance info", priority: "important" },
          { text: "Consider long-term care insurance policy", priority: "optional" },
        ],
        instructions: "Disability insurance replaces income if you can't work. Check with employer about STD and LTD coverage.",
        nokInstructions: "{partner}: If {primaryUser} is disabled but alive, file disability claims through employer HR and state disability office."
      }
    ]
  },
  {
    id: "property",
    name: "Property & Assets",
    icon: "\u{1F3E0}",
    color: "#B45309",
    description: "Home deed, vehicle title, international property, gold, valuables, and storage inventory.",
    folders: [
      {
        name: "Primary Home",
        templateType: "real_property",
        items: [
          { text: "Property deed / title (store original in safe)", priority: "critical" },
          { text: "Mortgage details — lender, account #, monthly payment", priority: "critical" },
          { text: "Property tax records and payment schedule", priority: "important" },
          { text: "HOA information, contacts, monthly dues", priority: "important" },
          { text: "Home warranty information", priority: "optional" },
          { text: "Transfer property into living trust via grant deed", priority: "critical" },
          { text: "Home maintenance contacts (plumber, electrician, HVAC)", priority: "optional" },
          { text: "Note property tax exemptions (homestead, etc.)", priority: "important" },
          { text: "Document current estimated home value", priority: "optional" },
        ],
        instructions: "Property should be in the living trust to avoid probate. Mortgage continues — it does NOT need to be paid off at death.",
        nokInstructions: "{partner}: Mortgage is NOT due in full at death. Keep making payments. The property transfers through the trust."
      },
      {
        name: "International Property",
        templateType: "foreign_property",
        items: [
          { text: "Property deed for international home", priority: "important" },
          { text: "Transfer property to proper names", priority: "important" },
          { text: "Document monthly maintenance plan and costs", priority: "important" },
          { text: "Safety deposit box contents inventory", priority: "important" },
          { text: "Digital copy of all property documents", priority: "optional" },
          { text: "Contact person for property management", priority: "important" },
          { text: "Document property tax payment process", priority: "important" },
        ],
        instructions: "International property transfer after death requires succession certificate from local courts. Local family can help manage.",
        nokInstructions: "{partner}: Contact local family for property matters. Succession certificate needed from local court."
      },
      {
        name: "Vehicles",
        templateType: "vehicle",
        items: [
          { text: "Vehicle title — store in safe", priority: "important" },
          { text: "Registration renewal dates and process", priority: "important" },
          { text: "Loan / lease details (if any)", priority: "important" },
          { text: "Vehicle account login (for connected cars)", priority: "important" },
          { text: "Current estimated value", priority: "optional" },
          { text: "Insurance policy details for the vehicle", priority: "important" },
          { text: "Document VIN number", priority: "important" },
        ],
        instructions: "Keep title in safe. For connected cars (Tesla, etc.), the account controls vehicle features.",
        nokInstructions: "{partner}: Vehicle account can be transferred. Contact manufacturer support with death certificate for ownership transfer."
      },
      {
        name: "Gold, Jewelry & Valuables",
        templateType: "valuables",
        items: [
          { text: "Gold jewelry inventory with weight (grams) and description", priority: "important" },
          { text: "Current gold price per gram noted (update quarterly)", priority: "optional" },
          { text: "Location of all jewelry (home safe vs bank locker)", priority: "important" },
          { text: "Appraisal documents for valuable items", priority: "optional" },
          { text: "Photos of all valuable items for insurance", priority: "important" },
          { text: "Document total estimated value of gold holdings", priority: "important" },
          { text: "Other collectibles or high-value items", priority: "optional" },
        ],
        instructions: "Keep jewelry inventory updated. Take photos for insurance claims. Store high-value items in safe.",
        nokInstructions: "{partner}: Gold and jewelry are listed here with locations. Get appraisals if selling. Bank locker may require succession certificate."
      }
    ]
  },
  {
    id: "taxes",
    name: "Tax Records & Filing",
    icon: "\u{1F4CB}",
    color: "#4338CA",
    description: "US and international tax returns, 1099s, W-2s, filing records, and CPA contacts.",
    folders: [
      {
        name: "US Tax Records",
        templateType: "us_tax",
        items: [
          { text: "Last 7 years of US tax returns (filed copies)", priority: "critical" },
          { text: "Current year W-2 from employer", priority: "important" },
          { text: "All 1099 forms organized by year", priority: "important" },
          { text: "Tax preparer/CPA contact information", priority: "important" },
          { text: "Estimated tax payment records", priority: "important" },
          { text: "Charitable donation receipts", priority: "important" },
          { text: "State tax returns", priority: "important" },
          { text: "Document tax software login", priority: "important" },
          { text: "Note: final tax return must be filed for year of death", priority: "critical" },
        ],
        instructions: "Keep tax returns for 7 years minimum. Final tax return must be filed for year of death.",
        nokInstructions: "{partner}: A final tax return must be filed for {primaryUser} for the year of death. Contact the CPA listed here."
      },
      {
        name: "International Tax Records",
        templateType: "foreign_tax",
        items: [
          { text: "Tax ID details — {primaryUser}", priority: "important" },
          { text: "Tax ID details — {partner}", priority: "important" },
          { text: "National ID details — {primaryUser}", priority: "important" },
          { text: "National ID details — {partner}", priority: "important" },
          { text: "International tax filings (last 5 years)", priority: "important" },
          { text: "International tax consultant contact", priority: "important" },
          { text: "Foreign account tax implications documented", priority: "optional" },
        ],
        instructions: "International income above threshold may require filing. Investment and insurance maturity have tax implications.",
        nokInstructions: "{partner}: International tax returns may need to be filed if there was foreign income. Contact the international tax consultant listed here."
      }
    ]
  },
  {
    id: "digital",
    name: "Digital Accounts & Access",
    icon: "\u{1F4BB}",
    color: "#2563EB",
    description: "Device passwords, email, cloud storage, subscriptions, social media, and password manager access.",
    folders: [
      {
        name: "Device Access & Password Manager",
        templateType: "device_access",
        items: [
          { text: "Phone PIN/password + Face ID backup method", priority: "critical" },
          { text: "Laptop/computer login password", priority: "critical" },
          { text: "Tablet/iPad access codes", priority: "important" },
          { text: "Password manager master password", priority: "critical" },
          { text: "Two-factor authentication backup codes", priority: "critical" },
          { text: "Recovery email and phone numbers documented", priority: "important" },
          { text: "Store master password in sealed envelope in safe", priority: "critical" },
          { text: "Document password manager emergency access procedure", priority: "critical" },
          { text: "Authenticator app backup/recovery method", priority: "important" },
        ],
        instructions: "Password manager is the KEY to everything. Store the master password in a sealed envelope in the safe.",
        nokInstructions: "{partner}: The password manager master password is in the sealed envelope in the safe. This unlocks ALL other accounts."
      },
      {
        name: "Email & Cloud Storage",
        templateType: "email_account",
        items: [
          { text: "Primary Gmail account", priority: "critical" },
          { text: "Google Inactive Account Manager configured for {partner}", priority: "critical" },
          { text: "Cloud storage subscription — keep active and pay", priority: "important" },
          { text: "Work email access", priority: "important" },
          { text: "iCloud account details", priority: "important" },
          { text: "Other email accounts documented", priority: "optional" },
          { text: "Apple ID and recovery details", priority: "important" },
          { text: "Apple Legacy Contact configured", priority: "important" },
        ],
        instructions: "Set up Google's Inactive Account Manager to give {partner} access. Cloud storage has important documents.",
        nokInstructions: "{partner}: Google Inactive Account Manager will notify you. Keep cloud storage subscription paid."
      },
      {
        name: "Subscriptions & Recurring Services",
        templateType: "subscription",
        items: [
          { text: "Streaming services — account details, payment method", priority: "optional" },
          { text: "Music subscription", priority: "optional" },
          { text: "Shopping memberships (Amazon Prime, etc.)", priority: "optional" },
          { text: "AI/productivity subscriptions", priority: "optional" },
          { text: "Note-taking app subscription", priority: "important" },
          { text: "Domain registrations and renewals", priority: "important" },
          { text: "Cloud hosting / server costs", priority: "optional" },
          { text: "List ALL recurring charges with amounts and payment methods", priority: "important" },
          { text: "Note annual vs monthly billing for each", priority: "optional" },
          { text: "Gym / fitness memberships", priority: "optional" },
        ],
        instructions: "List every recurring charge. Check credit card statements for the last 3 months to catch everything.",
        nokInstructions: "{partner}: Cancel subscriptions you don't need. Keep cloud storage, note-taking apps, and essential family services."
      },
      {
        name: "Social Media & Online Presence",
        templateType: "social_media",
        items: [
          { text: "Facebook / Instagram — memorialization preferences", priority: "optional" },
          { text: "LinkedIn — what to do with profile", priority: "optional" },
          { text: "Twitter/X account", priority: "optional" },
          { text: "GitHub account (personal projects and repos)", priority: "optional" },
          { text: "Blog / writing platform accounts", priority: "optional" },
          { text: "Set legacy contact on Facebook", priority: "optional" },
          { text: "Document desired action for each (memorialize, delete, or keep)", priority: "important" },
        ],
        instructions: "Set legacy contacts on Facebook. LinkedIn can be memorialized. Most platforms have processes for deceased users.",
        nokInstructions: "{partner}: You can memorialize or delete these accounts. Each platform has its own process. No rush on these."
      },
      {
        name: "Digital Knowledge Base",
        templateType: "digital_brain",
        items: [
          { text: "Document how your digital notes are organized", priority: "important" },
          { text: "Export/backup data quarterly to cloud storage", priority: "important" },
          { text: "Write guide for {partner} on navigating your digital notes", priority: "important" },
          { text: "Ensure subscription payment continues", priority: "important" },
          { text: "List the most important pages for {partner} to access", priority: "important" },
        ],
        instructions: "Your digital notes have years of life planning and critical information. Regular backups are essential.",
        nokInstructions: "{partner}: {primaryUser}'s digital notes contain the entire life organization system. Financial plans, goals for {firstChild}, and important notes are all there."
      }
    ]
  },
  {
    id: "health",
    name: "Health & Medical",
    icon: "\u{1F3E5}",
    color: "#E11D48",
    description: "Medical records, prescriptions, doctor contacts, health history, and immunization records.",
    folders: [
      {
        name: "Family Doctor & Provider List",
        templateType: "medical_provider",
        items: [
          { text: "Primary care physician — name, phone, address", priority: "critical" },
          { text: "{firstChild}'s pediatrician — name, phone, address", priority: "critical" },
          { text: "Dentist for family", priority: "important" },
          { text: "Eye doctor / optometrist", priority: "important" },
          { text: "Specialists", priority: "important" },
          { text: "Pharmacy name and prescription numbers", priority: "important" },
          { text: "Preferred hospital and urgent care", priority: "important" },
          { text: "Mental health provider (therapist/counselor)", priority: "optional" },
          { text: "{partner}'s OB/GYN", priority: "important" },
        ],
        instructions: "Keep this list updated and easily accessible. {partner} should be able to find any doctor's number quickly.",
        nokInstructions: "{partner}: All family doctors and their contact information are listed here."
      },
      {
        name: "Medical History & Records",
        templateType: "medical_history",
        items: [
          { text: "{primaryUser} medical history summary", priority: "important" },
          { text: "{partner} medical history summary", priority: "important" },
          { text: "{firstChild} vaccination records (up to date)", priority: "critical" },
          { text: "{firstChild} medical history and milestones", priority: "important" },
          { text: "Known allergies for ALL family members", priority: "critical" },
          { text: "Current medications list with dosages", priority: "critical" },
          { text: "Blood types for all family members", priority: "important" },
          { text: "Recent lab results and annual checkup summaries", priority: "optional" },
          { text: "Medical insurance ID cards (physical + photo)", priority: "important" },
        ],
        instructions: "Keep vaccination records up to date for children. Store medical records in secure cloud storage.",
        nokInstructions: "{partner}: Children's vaccination records are required for school. Medical histories are needed for new doctors."
      }
    ]
  },
  {
    id: "children",
    name: "Children & Education",
    icon: "\u{1F476}",
    color: "#EC4899",
    description: "{firstChild}'s school, activities, care instructions, education planning, and legacy letters.",
    folders: [
      {
        name: "{firstChild} — Daily Care & Routines",
        templateType: "child_care",
        items: [
          { text: "Daily routine and schedule documented", priority: "important" },
          { text: "Daycare/school name, address, phone, teacher name", priority: "critical" },
          { text: "Authorized pickup persons list", priority: "critical" },
          { text: "Dietary preferences and allergies", priority: "critical" },
          { text: "Emergency contact list at school", priority: "critical" },
          { text: "Babysitter/nanny contact info and schedule", priority: "important" },
          { text: "Favorite activities, comfort items, bedtime routine", priority: "optional" },
          { text: "Playdate friends and their parents' contacts", priority: "optional" },
        ],
        instructions: "Document the pickup/dropoff process clearly for backup person.",
        nokInstructions: "{partner}: School and daycare contacts are here. Update emergency contacts immediately."
      },
      {
        name: "Education Planning",
        templateType: "education_plan",
        items: [
          { text: "529 plan contribution schedule", priority: "important" },
          { text: "School district information and enrollment dates", priority: "important" },
          { text: "Educational goals and wishes for children", priority: "optional" },
          { text: "Extracurricular activity plans and costs", priority: "optional" },
          { text: "Private school research and application timelines", priority: "optional" },
          { text: "Tutoring or special education needs", priority: "optional" },
        ],
        instructions: "529 plan should continue contributions. Document your educational philosophy.",
        nokInstructions: "{partner}: Keep 529 contributions going if finances allow."
      },
      {
        name: "Letters & Memories for {firstChild}",
        templateType: "legacy_letter",
        items: [
          { text: "Write a personal letter to {firstChild} explaining who you are", priority: "critical" },
          { text: "Create a photo album/video collection of family memories", priority: "important" },
          { text: "Write about your values, hopes, and dreams for them", priority: "important" },
          { text: "Record video messages for major milestones", priority: "important" },
          { text: "Document family history and ancestry for children", priority: "optional" },
          { text: "Write letters for milestone ages (5, 10, 15, 18, 21, wedding)", priority: "important" },
          { text: "Create a playlist of meaningful songs", priority: "optional" },
          { text: "Document your favorite memories with your children", priority: "important" },
        ],
        instructions: "Make sure your children know you in case something happens. Start with a heartfelt letter.",
        nokInstructions: "{partner}: {primaryUser} wrote letters and created memories for the children. Give these to them at the appropriate ages."
      }
    ]
  },
  {
    id: "home",
    name: "Home & Household",
    icon: "\u{1F511}",
    color: "#65A30D",
    description: "Utility accounts, home maintenance, keys, warranties, and household contacts.",
    folders: [
      {
        name: "Utilities & Services",
        templateType: "utility_account",
        items: [
          { text: "Electricity — provider, account #, auto-pay setup", priority: "important" },
          { text: "Gas — provider, account #", priority: "important" },
          { text: "Water / sewer — provider, account #", priority: "important" },
          { text: "Internet / WiFi — provider, account #, WiFi password", priority: "important" },
          { text: "Trash / recycling — schedule and provider", priority: "optional" },
          { text: "Home security system — code, provider, monitoring", priority: "important" },
          { text: "Smart home device accounts", priority: "optional" },
          { text: "Cell phone plans — carrier, account #, plan details", priority: "important" },
          { text: "Streaming device logins", priority: "optional" },
        ],
        instructions: "Most utilities auto-pay. Document which credit card/bank account each uses.",
        nokInstructions: "{partner}: Keep utilities running. They're on auto-pay. Transfer account names as needed."
      },
      {
        name: "Keys & Access Codes",
        templateType: "keys_access",
        items: [
          { text: "House keys — labeled and inventoried", priority: "important" },
          { text: "Car keys / key card locations", priority: "important" },
          { text: "Safe combination / key location", priority: "critical" },
          { text: "Garage door code", priority: "important" },
          { text: "Mailbox key", priority: "important" },
          { text: "Storage unit key/code (if applicable)", priority: "optional" },
          { text: "Bank safety deposit box key", priority: "important" },
          { text: "Spare keys — who has them and for what", priority: "important" },
          { text: "Home alarm code and disarm procedure", priority: "important" },
        ],
        instructions: "Use labeled key tags. Store an inventory of what each key opens.",
        nokInstructions: "{partner}: All keys are tagged and labeled. Safe combination is documented in password manager."
      },
      {
        name: "Home Maintenance & Warranties",
        templateType: "home_maintenance",
        items: [
          { text: "HVAC system — model, warranty, service schedule", priority: "optional" },
          { text: "Appliance warranties and purchase dates", priority: "optional" },
          { text: "Plumber contact", priority: "important" },
          { text: "Electrician contact", priority: "important" },
          { text: "Handyman / general contractor contact", priority: "optional" },
          { text: "Landscaping / gardening service", priority: "optional" },
          { text: "Pest control service", priority: "optional" },
        ],
        instructions: "Keep a list of reliable service providers. Document any ongoing maintenance schedules.",
        nokInstructions: "{partner}: Service provider contacts are listed here. Most are on regular schedules."
      }
    ]
  },
  {
    id: "emergency",
    name: "Emergency & Contacts",
    icon: "\u{1F6A8}",
    color: "#DC2626",
    description: "Emergency contacts, first responder info, immediate action checklist, and 30-day plan.",
    folders: [
      {
        name: "Emergency Contacts",
        templateType: "emergency_contact",
        items: [
          { text: "{partner} mobile phone number", priority: "critical" },
          { text: "Close family member phone number", priority: "critical" },
          { text: "Closest family friend locally — phone", priority: "important" },
          { text: "Estate attorney — name, phone, email", priority: "critical" },
          { text: "Financial advisor — name, phone, email", priority: "important" },
          { text: "CPA / Tax preparer — name, phone, email", priority: "important" },
          { text: "Employer HR / benefits contact number", priority: "important" },
          { text: "Extended family contacts", priority: "important" },
          { text: "Neighbor with spare key — name, phone", priority: "important" },
          { text: "Children's school emergency line", priority: "important" },
        ],
        instructions: "Keep this list as the first page in your binder. Everyone should know where it is.",
        nokInstructions: "{partner}: Call these people in the first 48 hours. Attorney and financial advisor are the most critical calls."
      },
      {
        name: "First 48 Hours Checklist",
        templateType: "first_48_hours",
        items: [
          { text: "Obtain 15+ certified copies of death certificate", priority: "critical" },
          { text: "Notify employer — claim life insurance + final pay", priority: "critical" },
          { text: "Contact estate attorney", priority: "critical" },
          { text: "Secure the home and change locks if needed", priority: "important" },
          { text: "Notify Social Security Administration", priority: "critical" },
          { text: "Notify all banks and financial institutions", priority: "critical" },
          { text: "File for life insurance benefits", priority: "critical" },
          { text: "Elect COBRA health insurance within 60 days", priority: "critical" },
          { text: "Notify credit bureaus to prevent identity theft", priority: "important" },
          { text: "Freeze credit at all 3 bureaus", priority: "important" },
        ],
        instructions: "This is the immediate action list. Order certified death certificates immediately — you'll need many.",
        nokInstructions: "{partner}: Follow this list in order. Death certificates take 1-2 weeks. Order at least 15 copies."
      },
      {
        name: "First 30 Days Action Plan",
        templateType: "first_30_days",
        items: [
          { text: "Review and continue all auto-pay bills", priority: "important" },
          { text: "Change/secure all digital account access", priority: "important" },
          { text: "File for Social Security survivor benefits", priority: "critical" },
          { text: "Contact mortgage company about survivor options", priority: "important" },
          { text: "Review all insurance policies and file claims", priority: "critical" },
          { text: "Meet with financial advisor to review portfolio", priority: "important" },
          { text: "Update beneficiaries on {partner}'s own accounts", priority: "important" },
          { text: "Begin probate process (if assets not in trust)", priority: "important" },
          { text: "Notify international banks and start claim process", priority: "important" },
          { text: "File final tax return planning with CPA", priority: "important" },
        ],
        instructions: "After the immediate crisis, these are the next steps to stabilize finances and legal matters.",
        nokInstructions: "{partner}: Take it one step at a time. Lean on the attorney and financial advisor. You don't have to do everything alone."
      }
    ]
  },
  {
    id: "wishes",
    name: "Final Wishes & Legacy",
    icon: "\u{1F54A}\uFE0F",
    color: "#6B7280",
    description: "Funeral preferences, memorial wishes, legacy letters, personal history, and ethical will.",
    folders: [
      {
        name: "Funeral & Memorial Wishes",
        templateType: "funeral_wishes",
        items: [
          { text: "Cremation vs burial preference documented", priority: "important" },
          { text: "Memorial service preferences", priority: "important" },
          { text: "Religious/cultural ceremony wishes", priority: "important" },
          { text: "Who to invite / notify list", priority: "optional" },
          { text: "Music, readings, or other preferences", priority: "optional" },
          { text: "Where to scatter ashes / burial location", priority: "important" },
          { text: "Pre-paid funeral arrangements (if any)", priority: "optional" },
          { text: "Obituary preferences", priority: "optional" },
        ],
        instructions: "Document your wishes clearly so {partner} doesn't have to guess.",
        nokInstructions: "{partner}: {primaryUser}'s wishes are documented here. Follow them as closely as feels right."
      },
      {
        name: "Personal History & Ancestry",
        templateType: "personal_history",
        items: [
          { text: "Family tree documented", priority: "optional" },
          { text: "Family photos organized and labeled", priority: "optional" },
          { text: "Important family stories written down", priority: "optional" },
          { text: "Cultural traditions to pass to children", priority: "important" },
          { text: "Personal values and life philosophy documented", priority: "optional" },
          { text: "Record oral history with parents/elders", priority: "optional" },
        ],
        instructions: "Your values, stories, and cultural heritage are part of your legacy.",
        nokInstructions: "{partner}: These stories and traditions are for the children. Share them as they grow up."
      },
      {
        name: "Ethical Will / Letter of Values",
        templateType: "ethical_will",
        items: [
          { text: "Write a letter to {partner} about your life together", priority: "important" },
          { text: "Document your core values and life philosophy", priority: "important" },
          { text: "Write wishes for how family should live after you", priority: "optional" },
          { text: "Express gratitude to important people in your life", priority: "optional" },
          { text: "Share lessons learned that you want passed on", priority: "optional" },
        ],
        instructions: "An ethical will is not a legal document but a deeply personal one. Write from the heart.",
        nokInstructions: "{partner}: This is {primaryUser}'s personal letter to you and the family. Read when you're ready."
      }
    ]
  },
  {
    id: "work",
    name: "Career & Professional",
    icon: "\u{1F4BC}",
    color: "#0F766E",
    description: "Employment details, benefits, professional contacts, side projects, and intellectual property.",
    folders: [
      {
        name: "Current Employment",
        templateType: "employer",
        items: [
          { text: "Employee ID and HR portal login", priority: "important" },
          { text: "Manager name and contact", priority: "important" },
          { text: "HR / People Ops contact for bereavement", priority: "important" },
          { text: "Benefits summary (life insurance, 401k match, RSUs)", priority: "critical" },
          { text: "Vesting schedule for RSUs with dates", priority: "important" },
          { text: "Employer charitable match details", priority: "optional" },
          { text: "Outstanding expense reimbursements", priority: "optional" },
          { text: "PTO / vacation balance", priority: "optional" },
          { text: "Employer death benefit details", priority: "critical" },
        ],
        instructions: "{partner} should contact employer HR as one of the first calls.",
        nokInstructions: "{partner}: Call employer HR. They handle life insurance payout, final paycheck, RSU settlement, 401(k), and COBRA."
      },
      {
        name: "Side Projects & Intellectual Property",
        templateType: "side_project",
        items: [
          { text: "List all personal coding projects and repos", priority: "optional" },
          { text: "Blog / content platforms", priority: "optional" },
          { text: "Creative projects and digital assets", priority: "optional" },
          { text: "Domain names owned and renewal dates", priority: "important" },
          { text: "Learning materials and courses", priority: "optional" },
          { text: "Any revenue-generating content or projects", priority: "important" },
          { text: "Professional certifications and training records", priority: "optional" },
        ],
        instructions: "Document GitHub repos, domain names, and any revenue-generating content.",
        nokInstructions: "{partner}: Domain names need renewal or they're lost. Check domain registrar account."
      }
    ]
  },
  {
    id: "debts",
    name: "Debts & Liabilities",
    icon: "\u{1F4B3}",
    color: "#9333EA",
    description: "Mortgage, loans, credit card debts, international loans, and obligations tracker.",
    folders: [
      {
        name: "Mortgage",
        templateType: "mortgage",
        items: [
          { text: "Lender name, account number, and contact", priority: "critical" },
          { text: "Monthly payment amount and due date", priority: "critical" },
          { text: "Outstanding principal balance", priority: "critical" },
          { text: "Interest rate and type (fixed vs ARM)", priority: "important" },
          { text: "Escrow account details (taxes + insurance)", priority: "important" },
          { text: "Document that mortgage does NOT need to be paid off at death", priority: "critical" },
          { text: "Mortgage life insurance (if any)", priority: "optional" },
        ],
        instructions: "Mortgage continues after death. Survivor can keep paying and keep the house. No acceleration clause for death.",
        nokInstructions: "{partner}: Keep making mortgage payments. The house is yours through the trust. Contact lender to update account name."
      },
      {
        name: "Other Loans & Debts",
        templateType: "loan",
        items: [
          { text: "401(k) loan balance and repayment schedule", priority: "critical" },
          { text: "Student loans (if any)", priority: "optional" },
          { text: "Personal loans from family (if any)", priority: "optional" },
          { text: "Car loan / lease payments", priority: "important" },
          { text: "International loans or obligations (if any)", priority: "optional" },
          { text: "Document total monthly debt obligations", priority: "important" },
        ],
        instructions: "401(k) loan becomes taxable distribution if not repaid. Federal student loans are discharged at death.",
        nokInstructions: "{partner}: Some debts are forgiven at death (federal student loans). Others must be paid from estate. Consult attorney."
      }
    ]
  }
];
