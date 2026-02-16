// Template definitions for each checklist item type
// Each template has sections with fields that generate a 1-page fillable form
// Uses placeholders: {primaryUser}, {partner}, {firstChild}, {children}, {familyName}

const TEMPLATES = {
  custom_item: {
    title: "Custom Item Details",
    icon: "\u{1F4DD}",
    sections: [
      { title: "Item Information", fields: [
        { id: "description", label: "Detailed Description", type: "textarea", hint: "Provide a full description of this item" },
        { id: "location", label: "Location / Where to Find", type: "input", hint: "Where is this item stored or located?" },
        { id: "account_number", label: "Account/Reference Number (if applicable)", type: "input" },
        { id: "contact_info", label: "Contact Information", type: "textarea", hint: "Phone numbers, emails, or people to contact" },
      ]},
      { title: "Instructions", fields: [
        { id: "instructions", label: "Instructions for {partner}", type: "textarea", hint: "What should your next of kin do with this?" },
        { id: "deadline", label: "Deadline / Timeline", type: "input", hint: "Any time-sensitive deadlines to be aware of?" },
      ]},
      { title: "Additional Notes", fields: [
        { id: "notes", label: "Additional Notes", type: "textarea", hint: "Any other important information" },
        { id: "links", label: "Relevant Links or URLs", type: "textarea", hint: "Website links, document locations, etc." },
      ]}
    ]
  },

  birth_certificate: {
    title: "Birth Certificate Details",
    icon: "\u{1F4C4}",
    sections: [
      { title: "Document Details", fields: [
        { id: "person_name", label: "Person's Full Legal Name", type: "input" },
        { id: "dob", label: "Date of Birth", type: "input", hint: "MM/DD/YYYY" },
        { id: "place_of_birth", label: "Place of Birth (City, State/Country)", type: "input" },
        { id: "certificate_number", label: "Certificate Number", type: "input" },
        { id: "issuing_authority", label: "Issuing Authority / Vital Records Office", type: "input" },
      ]},
      { title: "Storage & Copies", fields: [
        { id: "original_location", label: "Where is the original stored?", type: "input", hint: "e.g., Fireproof safe, safety deposit box" },
        { id: "num_certified_copies", label: "How many certified copies do you have?", type: "input" },
        { id: "digital_copy_location", label: "Where is the digital scan stored?", type: "input", hint: "e.g., Google Drive path" },
      ]},
      { title: "After Death Instructions", fields: [
        { id: "who_needs_it", label: "Who will need this document and for what purpose?", type: "textarea" },
        { id: "how_to_get_more", label: "How to order additional certified copies?", type: "textarea", hint: "Include website, phone number, cost, and processing time" },
      ]}
    ]
  },

  passport: {
    title: "Passport / Travel Document Details",
    icon: "\u{1F6C2}",
    sections: [
      { title: "Document Details", fields: [
        { id: "holder_name", label: "Passport Holder's Full Name", type: "input" },
        { id: "passport_number", label: "Passport Number", type: "input" },
        { id: "country", label: "Issuing Country", type: "input" },
        { id: "issue_date", label: "Issue Date", type: "input" },
        { id: "expiry_date", label: "Expiry Date", type: "input" },
        { id: "place_of_issue", label: "Place of Issue", type: "input" },
      ]},
      { title: "Storage & Renewal", fields: [
        { id: "location", label: "Where is it stored?", type: "input" },
        { id: "renewal_process", label: "How to renew? (website/office)", type: "textarea" },
        { id: "renewal_cost", label: "Approximate renewal cost", type: "input" },
        { id: "calendar_reminder", label: "Calendar reminder set for renewal? (date)", type: "input" },
      ]},
      { title: "After Death Instructions", fields: [
        { id: "cancel_process", label: "Should this be cancelled or returned after death?", type: "textarea" },
        { id: "dependent_impact", label: "Does this affect any dependent's status?", type: "textarea" },
      ]}
    ]
  },

  ssn_card: {
    title: "Social Security Card Details",
    icon: "\u{1F4B3}",
    sections: [
      { title: "Card Details", fields: [
        { id: "person_name", label: "Full Legal Name on Card", type: "input" },
        { id: "ssn_last4", label: "Last 4 digits of SSN (for reference only)", type: "input", hint: "NEVER store full SSN in plain text" },
        { id: "password_manager", label: "Full SSN stored in which password manager?", type: "input" },
      ]},
      { title: "Storage", fields: [
        { id: "card_location", label: "Physical card location", type: "input" },
        { id: "digital_note", label: "Is it noted in encrypted password manager?", type: "input" },
      ]},
      { title: "After Death Instructions", fields: [
        { id: "needed_for", label: "What will the SSN be needed for after death?", type: "textarea", hint: "Death certificate, insurance claims, tax filings, bank transfers" },
        { id: "identity_protection", label: "Steps to protect against identity theft", type: "textarea" },
      ]}
    ]
  },

  immigration_doc: {
    title: "Immigration Document Details",
    icon: "\u{1F5FD}",
    sections: [
      { title: "Document Details", fields: [
        { id: "doc_type", label: "Document Type (Green Card, Naturalization Cert, etc.)", type: "input" },
        { id: "holder_name", label: "Holder's Full Name", type: "input" },
        { id: "document_number", label: "Document/Receipt Number", type: "input" },
        { id: "issue_date", label: "Issue Date", type: "input" },
        { id: "expiry_date", label: "Expiry Date (if applicable)", type: "input" },
        { id: "uscis_number", label: "USCIS Number (A-Number)", type: "input" },
      ]},
      { title: "Storage & Attorney", fields: [
        { id: "location", label: "Where is the original stored?", type: "input" },
        { id: "attorney_name", label: "Immigration attorney name", type: "input" },
        { id: "attorney_phone", label: "Immigration attorney phone", type: "input" },
      ]},
      { title: "After Death Instructions", fields: [
        { id: "dependent_impact", label: "How does your death affect dependent immigration status?", type: "textarea" },
        { id: "immediate_steps", label: "What immigration steps must dependents take immediately?", type: "textarea" },
        { id: "attorney_action", label: "Should immigration attorney be contacted? What for?", type: "textarea" },
      ]}
    ]
  },

  drivers_license: {
    title: "Driver License / State ID Details",
    icon: "\u{1F697}",
    sections: [
      { title: "License Details", fields: [
        { id: "holder_name", label: "Name on License", type: "input" },
        { id: "license_number", label: "License Number", type: "input" },
        { id: "state", label: "Issuing State", type: "input" },
        { id: "expiry_date", label: "Expiry Date", type: "input" },
        { id: "real_id", label: "REAL ID compliant? (Yes/No)", type: "input" },
      ]},
      { title: "After Death", fields: [
        { id: "return_to_dmv", label: "Should this be returned to DMV?", type: "input" },
        { id: "organ_donor", label: "Organ donor designation on license?", type: "input" },
      ]}
    ]
  },

  will: {
    title: "Will & Testament Details",
    icon: "\u{1F4DC}",
    sections: [
      { title: "Document Details", fields: [
        { id: "date_signed", label: "Date Will Was Signed", type: "input" },
        { id: "state_of_law", label: "Governed by which state's law?", type: "input" },
        { id: "attorney_name", label: "Attorney who drafted it", type: "input" },
        { id: "attorney_phone", label: "Attorney phone number", type: "input" },
        { id: "attorney_firm", label: "Law firm name and address", type: "textarea" },
      ]},
      { title: "Executor Details", fields: [
        { id: "primary_executor", label: "Primary Executor (name + contact)", type: "input" },
        { id: "backup_executor", label: "Backup Executor (name + contact)", type: "input" },
        { id: "executor_knows", label: "Does the executor know they are named?", type: "input" },
      ]},
      { title: "Key Provisions", fields: [
        { id: "asset_distribution", label: "Summary of asset distribution wishes", type: "textarea" },
        { id: "special_bequests", label: "Any special bequests or gifts?", type: "textarea" },
        { id: "charitable_donations", label: "Charitable donations specified?", type: "textarea" },
        { id: "foreign_property", label: "Foreign property instructions", type: "textarea" },
      ]},
      { title: "Storage & Access", fields: [
        { id: "original_location", label: "Where is the original stored?", type: "input" },
        { id: "copy_locations", label: "Where are copies stored?", type: "textarea" },
        { id: "last_reviewed", label: "When was the will last reviewed/updated?", type: "input" },
      ]},
      { title: "After Death Instructions", fields: [
        { id: "probate_needed", label: "Is probate needed? (depends on trust)", type: "textarea" },
        { id: "first_steps", label: "First steps after death regarding this will", type: "textarea" },
      ]}
    ]
  },

  trust: {
    title: "Living Trust Details",
    icon: "\u{1F3DB}\uFE0F",
    sections: [
      { title: "Trust Details", fields: [
        { id: "trust_name", label: "Full Trust Name", type: "input" },
        { id: "date_created", label: "Date Trust Was Created", type: "input" },
        { id: "trust_type", label: "Trust Type (Revocable/Irrevocable)", type: "input" },
        { id: "attorney_name", label: "Attorney who created it", type: "input" },
        { id: "attorney_phone", label: "Attorney phone", type: "input" },
      ]},
      { title: "Trustee Information", fields: [
        { id: "trustee", label: "Current Trustee (name + contact)", type: "input" },
        { id: "successor_trustee", label: "Successor Trustee (name + contact)", type: "input" },
        { id: "trustee_powers", label: "Summary of trustee powers", type: "textarea" },
      ]},
      { title: "Assets in Trust", fields: [
        { id: "real_property", label: "Real property transferred to trust?", type: "textarea" },
        { id: "bank_accounts", label: "Bank accounts in trust name?", type: "textarea" },
        { id: "investment_accounts", label: "Investment accounts in trust?", type: "textarea" },
        { id: "missing_assets", label: "Any assets NOT yet transferred to trust?", type: "textarea" },
      ]},
      { title: "After Death Instructions", fields: [
        { id: "successor_steps", label: "Steps for successor trustee after death", type: "textarea" },
        { id: "distribution_plan", label: "How are trust assets distributed?", type: "textarea" },
      ]}
    ]
  },

  poa: {
    title: "Power of Attorney Details",
    icon: "\u{1F4DD}",
    sections: [
      { title: "POA Details", fields: [
        { id: "poa_type", label: "Type (Financial / Healthcare / Both)", type: "input" },
        { id: "principal", label: "Principal (who grants the POA)", type: "input" },
        { id: "agent", label: "Agent (who receives the POA authority)", type: "input" },
        { id: "backup_agent", label: "Backup Agent", type: "input" },
        { id: "date_signed", label: "Date Signed", type: "input" },
        { id: "notarized", label: "Notarized? (Yes/No)", type: "input" },
      ]},
      { title: "Scope & Limitations", fields: [
        { id: "powers_granted", label: "What powers are granted?", type: "textarea" },
        { id: "limitations", label: "Any limitations or restrictions?", type: "textarea" },
        { id: "effective_when", label: "When does it become effective? (Immediately / Upon incapacity)", type: "input" },
      ]},
      { title: "Storage & Distribution", fields: [
        { id: "original_location", label: "Where is the original stored?", type: "input" },
        { id: "copies_given_to", label: "Who has copies? (banks, attorney, etc.)", type: "textarea" },
      ]},
      { title: "After Death Note", fields: [
        { id: "death_note", label: "POA terminates at death. What replaces it?", type: "textarea", hint: "Usually the executor/trustee takes over" },
      ]}
    ]
  },

  guardianship: {
    title: "Guardianship Designation Details",
    icon: "\u{1F9D2}",
    sections: [
      { title: "Guardian Details", fields: [
        { id: "primary_guardian", label: "Primary Guardian (name + contact)", type: "input" },
        { id: "guardian_relation", label: "Relationship to child", type: "input" },
        { id: "backup_guardian", label: "Backup Guardian (name + contact)", type: "input" },
        { id: "guardian_agreed", label: "Has guardian agreed to serve?", type: "input" },
      ]},
      { title: "Your Wishes for Children", fields: [
        { id: "upbringing_values", label: "Values you want your children raised with", type: "textarea" },
        { id: "education_wishes", label: "Educational wishes (public/private, college plans)", type: "textarea" },
        { id: "cultural_wishes", label: "Cultural/religious wishes for upbringing", type: "textarea" },
        { id: "financial_provisions", label: "Financial provisions for guardian (from trust)", type: "textarea" },
      ]},
      { title: "After Both Parents Die", fields: [
        { id: "immediate_steps", label: "Immediate steps for guardian to take", type: "textarea" },
        { id: "financial_access", label: "How does guardian access funds for children?", type: "textarea" },
        { id: "oversight", label: "Is there a trust protector or oversight person?", type: "textarea" },
      ]}
    ]
  },

  healthcare_directive: {
    title: "Healthcare Directive Details",
    icon: "\u{1F3E5}",
    sections: [
      { title: "Directive Details", fields: [
        { id: "type", label: "Type (Living Will / Advance Directive)", type: "input" },
        { id: "date_signed", label: "Date Signed", type: "input" },
        { id: "healthcare_agent", label: "Healthcare Agent (name + phone)", type: "input" },
        { id: "backup_agent", label: "Backup Healthcare Agent", type: "input" },
      ]},
      { title: "Medical Preferences", fields: [
        { id: "life_support", label: "Life support preferences", type: "textarea" },
        { id: "dnr", label: "DNR preference (Yes/No + details)", type: "textarea" },
        { id: "organ_donation", label: "Organ donation preference", type: "input" },
        { id: "pain_management", label: "Pain management preferences", type: "textarea" },
      ]},
      { title: "Distribution", fields: [
        { id: "doctor_has_copy", label: "Does your primary doctor have a copy?", type: "input" },
        { id: "hospital_on_file", label: "On file at preferred hospital?", type: "input" },
        { id: "original_location", label: "Where is the original?", type: "input" },
      ]}
    ]
  },

  beneficiary_master: {
    title: "Beneficiary Designation Tracker",
    icon: "\u{1F465}",
    sections: [
      { title: "Account Information", fields: [
        { id: "account_name", label: "Account Name / Institution", type: "input" },
        { id: "account_number", label: "Account Number (last 4)", type: "input" },
        { id: "account_type", label: "Account Type (401k, IRA, Life Insurance, etc.)", type: "input" },
      ]},
      { title: "Beneficiary Details", fields: [
        { id: "primary_beneficiary", label: "Primary Beneficiary (name + % share)", type: "input" },
        { id: "contingent_beneficiary", label: "Contingent Beneficiary (name + % share)", type: "input" },
        { id: "last_updated", label: "When was beneficiary last updated?", type: "input" },
        { id: "matches_will", label: "Does this match your will/trust intentions?", type: "input" },
      ]},
      { title: "After Death", fields: [
        { id: "claim_process", label: "How to file beneficiary claim", type: "textarea" },
        { id: "docs_needed", label: "Documents needed for claim", type: "textarea" },
        { id: "phone_number", label: "Phone number for claims", type: "input" },
      ]}
    ]
  },

  bank_account: {
    title: "Bank Account Details",
    icon: "\u{1F3E6}",
    sections: [
      { title: "Account Information", fields: [
        { id: "bank_name", label: "Bank Name", type: "input" },
        { id: "account_type", label: "Account Type (Checking/Savings/HYS)", type: "input" },
        { id: "account_number", label: "Account Number", type: "input" },
        { id: "routing_number", label: "Routing Number", type: "input" },
        { id: "online_url", label: "Online Banking URL", type: "input" },
        { id: "username", label: "Username / Login ID", type: "input" },
        { id: "password_location", label: "Where is password stored? (e.g., 1Password)", type: "input" },
      ]},
      { title: "Account Details", fields: [
        { id: "joint_owner", label: "Joint account holder (if any)", type: "input" },
        { id: "approximate_balance", label: "Approximate current balance", type: "input" },
        { id: "auto_pay_bills", label: "What bills auto-pay from this account?", type: "textarea" },
        { id: "direct_deposits", label: "What direct deposits come into this account?", type: "textarea" },
      ]},
      { title: "After Death Instructions", fields: [
        { id: "keep_or_close", label: "Should this account be kept open or closed?", type: "textarea", hint: "Consider auto-pays before closing" },
        { id: "transfer_funds_to", label: "Transfer remaining funds to which account?", type: "input" },
        { id: "claim_process", label: "How to claim as joint owner or beneficiary", type: "textarea" },
        { id: "contact_number", label: "Bank phone number for estate/death claims", type: "input" },
      ]}
    ]
  },

  foreign_bank_account: {
    title: "Foreign Bank Account Details",
    icon: "🌍",
    sections: [
      { title: "Account Information", fields: [
        { id: "country", label: "Country", type: "input" },
        { id: "bank_name", label: "Bank Name", type: "input" },
        { id: "account_type", label: "Account Type (Savings/Checking/FD/NRE/NRO)", type: "input" },
        { id: "account_number", label: "Account Number", type: "input" },
        { id: "routing_code", label: "Routing/SWIFT/IFSC Code", type: "input" },
        { id: "branch_name", label: "Branch Name and Address", type: "input" },
        { id: "online_url", label: "Internet Banking URL", type: "input" },
        { id: "currency", label: "Account Currency", type: "input" },
      ]},
      { title: "Nominee & Access", fields: [
        { id: "nominee", label: "Nominated person on account", type: "input" },
        { id: "joint_holder", label: "Joint account holder (if any)", type: "input" },
        { id: "approximate_balance", label: "Approximate balance (local currency)", type: "input" },
        { id: "fd_maturity", label: "Fixed deposit maturity dates (if applicable)", type: "input" },
      ]},
      { title: "After Death Instructions", fields: [
        { id: "claim_process", label: "How to claim funds (documents needed)?", type: "textarea", hint: "Death certificate (may need apostille), succession certificate, nominee form, ID proof" },
        { id: "local_contact", label: "Local contact person for bank visits", type: "input" },
        { id: "repatriation", label: "How to transfer/repatriate funds?", type: "textarea" },
        { id: "tax_implications", label: "Tax implications of inheriting this account", type: "textarea" },
      ]}
    ]
  },

  credit_card: {
    title: "Credit Card Details",
    icon: "\u{1F4B3}",
    sections: [
      { title: "Card Information", fields: [
        { id: "card_issuer", label: "Card Issuer (Chase, Amex, etc.)", type: "input" },
        { id: "card_type", label: "Card Type (Visa, Mastercard, Amex)", type: "input" },
        { id: "last_4_digits", label: "Last 4 Digits", type: "input" },
        { id: "credit_limit", label: "Credit Limit", type: "input" },
        { id: "online_url", label: "Online Account URL", type: "input" },
        { id: "username", label: "Username", type: "input" },
        { id: "password_location", label: "Where is password stored?", type: "input" },
      ]},
      { title: "Recurring Charges", fields: [
        { id: "recurring_charges", label: "List all recurring charges on this card", type: "textarea", hint: "Netflix, Spotify, insurance premiums, etc." },
        { id: "authorized_users", label: "Authorized users on this card", type: "input" },
        { id: "rewards_balance", label: "Current rewards points balance", type: "input" },
      ]},
      { title: "After Death Instructions", fields: [
        { id: "action", label: "What should happen to this card? (Cancel / Transfer charges)", type: "textarea" },
        { id: "rewards_redeem", label: "How to redeem remaining rewards points", type: "textarea" },
        { id: "outstanding_balance", label: "Who is responsible for outstanding balance?", type: "textarea", hint: "Joint accounts: surviving holder. Individual: estate." },
        { id: "notification", label: "How to notify issuer of death", type: "textarea" },
      ]}
    ]
  },

  investment_account: {
    title: "Investment Account Details",
    icon: "\u{1F4C8}",
    sections: [
      { title: "Account Information", fields: [
        { id: "institution", label: "Brokerage / Institution", type: "input" },
        { id: "account_type", label: "Account Type (Individual/Joint/Trust)", type: "input" },
        { id: "account_number", label: "Account Number", type: "input" },
        { id: "online_url", label: "Online Access URL", type: "input" },
        { id: "username", label: "Username", type: "input" },
        { id: "password_location", label: "Where is password stored?", type: "input" },
      ]},
      { title: "Holdings & Strategy", fields: [
        { id: "approximate_value", label: "Approximate current value", type: "input" },
        { id: "investment_strategy", label: "Investment strategy / allocation", type: "textarea" },
        { id: "auto_investments", label: "Any automatic/recurring investments?", type: "textarea" },
        { id: "primary_beneficiary", label: "Primary beneficiary on this account", type: "input" },
        { id: "contingent_beneficiary", label: "Contingent beneficiary", type: "input" },
      ]},
      { title: "After Death Instructions", fields: [
        { id: "action", label: "What should happen to this account?", type: "textarea", hint: "Transfer to beneficiary, liquidate, keep invested" },
        { id: "tax_implications", label: "Tax implications of inheritance (step-up basis?)", type: "textarea" },
        { id: "advisor_contact", label: "Financial advisor contact for this account", type: "input" },
        { id: "claim_process", label: "Steps to claim as beneficiary", type: "textarea" },
      ]}
    ]
  },

  retirement_account: {
    title: "Retirement Account Details",
    icon: "\u{1F3E6}",
    sections: [
      { title: "Account Information", fields: [
        { id: "institution", label: "Institution (Vanguard, Fidelity, etc.)", type: "input" },
        { id: "account_type", label: "Account Type (401k/Roth IRA/Traditional IRA/PPF)", type: "input" },
        { id: "account_number", label: "Account Number", type: "input" },
        { id: "employer_plan", label: "Employer plan? Which employer?", type: "input" },
        { id: "online_url", label: "Online Access URL", type: "input" },
      ]},
      { title: "Balance & Contributions", fields: [
        { id: "approximate_value", label: "Approximate current value", type: "input" },
        { id: "contribution_amount", label: "Current contribution amount per paycheck", type: "input" },
        { id: "employer_match", label: "Employer match details", type: "input" },
        { id: "loan_balance", label: "Outstanding loan balance (if any)", type: "input", hint: "CRITICAL: Loan becomes taxable distribution at death" },
        { id: "primary_beneficiary", label: "Primary beneficiary", type: "input" },
      ]},
      { title: "After Death Instructions", fields: [
        { id: "spouse_options", label: "Options for surviving spouse", type: "textarea", hint: "Rollover to own IRA, inherited IRA, lump sum" },
        { id: "tax_treatment", label: "Tax treatment for beneficiary", type: "textarea" },
        { id: "rmd_implications", label: "Required Minimum Distribution implications", type: "textarea" },
        { id: "claim_phone", label: "Phone number for beneficiary claims", type: "input" },
      ]}
    ]
  },

  rsu_stock: {
    title: "Employer Stock / RSU Details",
    icon: "\u{1F4B9}",
    sections: [
      { title: "Account Details", fields: [
        { id: "employer", label: "Employer", type: "input" },
        { id: "platform", label: "Stock plan platform (Morgan Stanley, E*Trade, etc.)", type: "input" },
        { id: "account_number", label: "Account Number", type: "input" },
        { id: "online_url", label: "Online Access URL", type: "input" },
      ]},
      { title: "Holdings", fields: [
        { id: "vested_shares", label: "Number of vested shares", type: "input" },
        { id: "unvested_rsus", label: "Number of unvested RSUs", type: "input" },
        { id: "next_vesting_date", label: "Next vesting date and amount", type: "input" },
        { id: "espp_details", label: "ESPP enrollment details", type: "textarea" },
        { id: "cost_basis", label: "Cost basis information for tax purposes", type: "textarea" },
      ]},
      { title: "After Death Instructions", fields: [
        { id: "vested_treatment", label: "What happens to vested shares at death?", type: "textarea" },
        { id: "unvested_treatment", label: "What happens to unvested RSUs? (Company policy)", type: "textarea" },
        { id: "hr_contact", label: "HR contact for equity questions", type: "input" },
        { id: "sell_or_hold", label: "Recommendation: sell or hold?", type: "textarea" },
      ]}
    ]
  },

  hsa_fsa: {
    title: "HSA / FSA Account Details",
    icon: "\u{1FA7A}",
    sections: [
      { title: "Account Details", fields: [
        { id: "provider", label: "Provider (HealthEquity, etc.)", type: "input" },
        { id: "account_type", label: "Account Type (HSA/FSA/DCFSA)", type: "input" },
        { id: "cash_balance", label: "Cash Balance", type: "input" },
        { id: "investment_balance", label: "Investment Balance (if HSA)", type: "input" },
        { id: "online_url", label: "Online Access URL", type: "input" },
      ]},
      { title: "Deadlines & Beneficiary", fields: [
        { id: "fsa_deadline", label: "FSA use-by deadline", type: "input", hint: "FSA funds expire! Use them or lose them." },
        { id: "beneficiary", label: "Named beneficiary", type: "input" },
        { id: "pending_claims", label: "Any pending reimbursement claims?", type: "textarea" },
      ]},
      { title: "After Death Instructions", fields: [
        { id: "hsa_transfer", label: "HSA transfer to spouse (tax-free)", type: "textarea" },
        { id: "fsa_urgency", label: "FSA: Submit ALL medical receipts before deadline", type: "textarea" },
        { id: "receipts_location", label: "Where are medical receipts stored?", type: "input" },
      ]}
    ]
  },

  education_529: {
    title: "529 Education Savings Details",
    icon: "\u{1F393}",
    sections: [
      { title: "Account Details", fields: [
        { id: "plan_name", label: "Plan Name (ScholarShare, etc.)", type: "input" },
        { id: "account_number", label: "Account Number", type: "input" },
        { id: "owner", label: "Account Owner", type: "input" },
        { id: "beneficiary", label: "Beneficiary (child's name)", type: "input" },
        { id: "successor_owner", label: "Successor Owner", type: "input" },
        { id: "current_balance", label: "Current Balance", type: "input" },
      ]},
      { title: "Contributions", fields: [
        { id: "annual_target", label: "Annual contribution target", type: "input" },
        { id: "auto_contribution", label: "Auto-contribution amount and frequency", type: "input" },
        { id: "investment_option", label: "Current investment option/allocation", type: "input" },
      ]},
      { title: "After Death Instructions", fields: [
        { id: "transfer_process", label: "How does successor owner take over?", type: "textarea" },
        { id: "continue_contributions", label: "Should contributions continue? From what source?", type: "textarea" },
        { id: "usage_rules", label: "What can funds be used for (qualified expenses)?", type: "textarea" },
      ]}
    ]
  },

  crypto_account: {
    title: "Cryptocurrency Account Details",
    icon: "\u{1FA99}",
    sections: [
      { title: "Account/Wallet Details", fields: [
        { id: "platform", label: "Exchange/Wallet Platform", type: "input" },
        { id: "account_type", label: "Type (Exchange/Hardware Wallet/Software Wallet)", type: "input" },
        { id: "holdings_summary", label: "Holdings summary (BTC, ETH, etc.)", type: "textarea" },
        { id: "approximate_value", label: "Approximate total value (USD)", type: "input" },
      ]},
      { title: "Access & Security", fields: [
        { id: "seed_phrase_location", label: "Where is the seed/recovery phrase stored?", type: "input", hint: "MUST be physical. NEVER digital." },
        { id: "password_location", label: "Where is the exchange password stored?", type: "input" },
        { id: "2fa_method", label: "2FA method and backup codes location", type: "input" },
      ]},
      { title: "After Death Instructions", fields: [
        { id: "access_steps", label: "Step-by-step: how to access these funds", type: "textarea" },
        { id: "liquidation", label: "Recommendation: hold or liquidate?", type: "textarea" },
        { id: "tax_basis", label: "Cost basis for tax purposes", type: "textarea" },
        { id: "helper_contact", label: "Tech-savvy person who can help {partner}", type: "input" },
      ]}
    ]
  },

  life_insurance: {
    title: "Life Insurance Policy Details",
    icon: "\u{1F6E1}\uFE0F",
    sections: [
      { title: "Policy Details", fields: [
        { id: "company", label: "Insurance Company", type: "input" },
        { id: "policy_number", label: "Policy Number", type: "input" },
        { id: "policy_type", label: "Policy Type (Term/Whole/Group/Employer)", type: "input" },
        { id: "face_value", label: "Death Benefit Amount", type: "input" },
        { id: "premium", label: "Premium Amount and Frequency", type: "input" },
      ]},
      { title: "Beneficiary & Agent", fields: [
        { id: "primary_beneficiary", label: "Primary Beneficiary", type: "input" },
        { id: "contingent_beneficiary", label: "Contingent Beneficiary", type: "input" },
        { id: "agent_name", label: "Insurance Agent Name", type: "input" },
        { id: "agent_phone", label: "Agent Phone Number", type: "input" },
      ]},
      { title: "After Death Claim Process", fields: [
        { id: "claim_phone", label: "Claims Department Phone Number", type: "input" },
        { id: "docs_needed", label: "Documents needed to file claim", type: "textarea", hint: "Death certificate, policy, claimant ID, claim form" },
        { id: "expected_timeline", label: "Expected claim processing time", type: "input" },
        { id: "payout_options", label: "Payout options (lump sum vs annuity)", type: "textarea" },
      ]}
    ]
  },

  health_insurance: {
    title: "Health Insurance Details",
    icon: "\u{1FA7A}",
    sections: [
      { title: "Plan Details", fields: [
        { id: "provider", label: "Insurance Provider", type: "input" },
        { id: "plan_name", label: "Plan Name", type: "input" },
        { id: "group_number", label: "Group Number", type: "input" },
        { id: "member_id", label: "Primary User Member ID", type: "input" },
        { id: "member_id_spouse", label: "Partner Member ID", type: "input" },
        { id: "member_id_child", label: "Child Member ID", type: "input" },
      ]},
      { title: "Coverage Details", fields: [
        { id: "monthly_premium", label: "Monthly Premium (employer portion + employee)", type: "input" },
        { id: "deductible", label: "Annual Deductible", type: "input" },
        { id: "oop_max", label: "Out-of-Pocket Maximum", type: "input" },
      ]},
      { title: "After Death - COBRA", fields: [
        { id: "cobra_deadline", label: "COBRA election deadline (60 days from qualifying event)", type: "input" },
        { id: "cobra_cost", label: "Estimated monthly COBRA cost", type: "input" },
        { id: "cobra_duration", label: "COBRA continuation period", type: "input", hint: "36 months for dependents after death of employee" },
        { id: "alternative_options", label: "Alternative coverage options (marketplace, etc.)", type: "textarea" },
      ]}
    ]
  },

  property_insurance: {
    title: "Property Insurance Details",
    icon: "\u{1F3E0}",
    sections: [
      { title: "Policy Details", fields: [
        { id: "type", label: "Insurance Type (Home/Auto/Umbrella/Earthquake)", type: "input" },
        { id: "company", label: "Insurance Company", type: "input" },
        { id: "policy_number", label: "Policy Number", type: "input" },
        { id: "annual_premium", label: "Annual Premium", type: "input" },
        { id: "deductible", label: "Deductible Amount", type: "input" },
        { id: "coverage_amount", label: "Coverage Amount", type: "input" },
      ]},
      { title: "Agent & Contact", fields: [
        { id: "agent_name", label: "Agent Name", type: "input" },
        { id: "agent_phone", label: "Agent Phone", type: "input" },
        { id: "renewal_date", label: "Policy Renewal Date", type: "input" },
      ]},
      { title: "After Death Instructions", fields: [
        { id: "keep_active", label: "Must this policy stay active? (Yes - property still needs coverage)", type: "textarea" },
        { id: "name_change", label: "How to change policy holder name", type: "textarea" },
      ]}
    ]
  },

  disability_insurance: {
    title: "Disability Insurance Details",
    icon: "\u{1FA7C}",
    sections: [
      { title: "Coverage Details", fields: [
        { id: "provider", label: "Provider", type: "input" },
        { id: "type", label: "Type (Short-term / Long-term / State)", type: "input" },
        { id: "benefit_amount", label: "Monthly Benefit Amount", type: "input" },
        { id: "elimination_period", label: "Elimination / Waiting Period", type: "input" },
        { id: "benefit_period", label: "Maximum Benefit Period", type: "input" },
      ]},
      { title: "How to File Claim", fields: [
        { id: "claim_phone", label: "Claims phone number", type: "input" },
        { id: "claim_process", label: "Step-by-step claim process", type: "textarea" },
        { id: "docs_needed", label: "Documents needed", type: "textarea" },
      ]}
    ]
  },

  real_property: {
    title: "Real Property Details",
    icon: "\u{1F3E0}",
    sections: [
      { title: "Property Details", fields: [
        { id: "address", label: "Full Property Address", type: "textarea" },
        { id: "property_type", label: "Property Type (Single Family / Condo / etc.)", type: "input" },
        { id: "purchase_date", label: "Purchase Date", type: "input" },
        { id: "purchase_price", label: "Purchase Price", type: "input" },
        { id: "current_value", label: "Estimated Current Value", type: "input" },
        { id: "in_trust", label: "Is this property in the living trust?", type: "input" },
      ]},
      { title: "Mortgage", fields: [
        { id: "lender", label: "Mortgage Lender", type: "input" },
        { id: "account_number", label: "Loan Account Number", type: "input" },
        { id: "monthly_payment", label: "Monthly Payment Amount", type: "input" },
        { id: "remaining_balance", label: "Remaining Balance", type: "input" },
        { id: "interest_rate", label: "Interest Rate", type: "input" },
      ]},
      { title: "Property Tax & HOA", fields: [
        { id: "annual_tax", label: "Annual Property Tax Amount", type: "input" },
        { id: "tax_paid_via", label: "Taxes paid through escrow or directly?", type: "input" },
        { id: "hoa_monthly", label: "HOA Monthly Dues", type: "input" },
        { id: "hoa_contact", label: "HOA Contact Info", type: "input" },
      ]},
      { title: "After Death Instructions", fields: [
        { id: "ownership_transfer", label: "How does ownership transfer? (Trust/probate)", type: "textarea" },
        { id: "keep_or_sell", label: "Recommendation: keep or sell?", type: "textarea" },
        { id: "mortgage_continues", label: "Note: mortgage is NOT due in full at death", type: "textarea" },
      ]}
    ]
  },

  foreign_property: {
    title: "Foreign Property Details",
    icon: "🌍",
    sections: [
      { title: "Property Details", fields: [
        { id: "country", label: "Country", type: "input" },
        { id: "address", label: "Full Property Address", type: "textarea" },
        { id: "property_type", label: "Property Type", type: "input" },
        { id: "current_owners", label: "Current registered owners", type: "input" },
        { id: "estimated_value", label: "Estimated current value (local currency)", type: "input" },
      ]},
      { title: "Documents & Maintenance", fields: [
        { id: "deed_location", label: "Where is the property deed stored?", type: "input" },
        { id: "monthly_maintenance", label: "Monthly maintenance cost", type: "input" },
        { id: "caretaker", label: "Local caretaker/contact person", type: "input" },
        { id: "property_tax", label: "Annual property tax and payment method", type: "input" },
      ]},
      { title: "After Death Instructions", fields: [
        { id: "succession_process", label: "Succession/inheritance process in this country", type: "textarea" },
        { id: "local_helper", label: "Who will handle local proceedings?", type: "input" },
        { id: "sell_or_keep", label: "Should property be kept or sold?", type: "textarea" },
        { id: "tax_implications", label: "Tax implications of foreign property inheritance", type: "textarea" },
      ]}
    ]
  },

  vehicle: {
    title: "Vehicle Details",
    icon: "\u{1F697}",
    sections: [
      { title: "Vehicle Information", fields: [
        { id: "make_model", label: "Make, Model, Year", type: "input" },
        { id: "vin", label: "VIN Number", type: "input" },
        { id: "license_plate", label: "License Plate Number", type: "input" },
        { id: "color", label: "Color", type: "input" },
        { id: "title_location", label: "Where is the title stored?", type: "input" },
      ]},
      { title: "Financing & Insurance", fields: [
        { id: "loan_lender", label: "Loan Lender (if applicable)", type: "input" },
        { id: "monthly_payment", label: "Monthly Payment", type: "input" },
        { id: "payoff_amount", label: "Current Payoff Amount", type: "input" },
        { id: "insurance_policy", label: "Insurance Policy Number", type: "input" },
        { id: "estimated_value", label: "Estimated current value", type: "input" },
      ]},
      { title: "Digital Access (Tesla)", fields: [
        { id: "tesla_account", label: "Tesla Account Email", type: "input" },
        { id: "tesla_password_loc", label: "Where is Tesla account password stored?", type: "input" },
        { id: "key_card_location", label: "Key card / key fob locations", type: "input" },
      ]},
      { title: "After Death Instructions", fields: [
        { id: "keep_or_sell", label: "Keep or sell the vehicle?", type: "textarea" },
        { id: "title_transfer", label: "How to transfer title to surviving spouse", type: "textarea" },
        { id: "account_transfer", label: "How to transfer Tesla account", type: "textarea" },
      ]}
    ]
  },

  valuables: {
    title: "Gold, Jewelry & Valuables Details",
    icon: "\u{1F48E}",
    sections: [
      { title: "Item Inventory", fields: [
        { id: "description", label: "Item Description", type: "textarea" },
        { id: "weight", label: "Weight (grams for gold)", type: "input" },
        { id: "estimated_value", label: "Estimated Value", type: "input" },
        { id: "location", label: "Storage Location", type: "input" },
        { id: "photo_location", label: "Where are photos of this item stored?", type: "input" },
      ]},
      { title: "Insurance & Appraisal", fields: [
        { id: "insured", label: "Is this item insured? Policy details?", type: "input" },
        { id: "appraisal_date", label: "Last appraisal date", type: "input" },
        { id: "appraisal_value", label: "Appraised value", type: "input" },
      ]},
      { title: "After Death Instructions", fields: [
        { id: "who_gets_it", label: "Who should receive this item?", type: "input" },
        { id: "sell_or_keep", label: "Keep as family heirloom or sell?", type: "textarea" },
        { id: "bank_locker", label: "If in bank locker: succession certificate may be needed", type: "textarea" },
      ]}
    ]
  },

  us_tax: {
    title: "US Tax Record Details",
    icon: "\u{1F4CB}",
    sections: [
      { title: "Tax Professional", fields: [
        { id: "cpa_name", label: "CPA / Tax Preparer Name", type: "input" },
        { id: "cpa_firm", label: "Firm Name", type: "input" },
        { id: "cpa_phone", label: "Phone Number", type: "input" },
        { id: "cpa_email", label: "Email", type: "input" },
      ]},
      { title: "Filing Details", fields: [
        { id: "filing_status", label: "Current Filing Status", type: "input" },
        { id: "tax_software", label: "Tax Software Used (TurboTax, etc.)", type: "input" },
        { id: "software_login", label: "Tax software login (in password manager?)", type: "input" },
        { id: "returns_location", label: "Where are past returns stored?", type: "input" },
      ]},
      { title: "After Death Instructions", fields: [
        { id: "final_return", label: "Final return must be filed for year of death", type: "textarea" },
        { id: "estate_return", label: "Estate tax return needed? (threshold check)", type: "textarea" },
        { id: "state_return", label: "California state return also required", type: "textarea" },
      ]}
    ]
  },

  foreign_tax: {
    title: "Foreign Tax Details",
    icon: "🌍",
    sections: [
      { title: "Tax IDs", fields: [
        { id: "country", label: "Country", type: "input" },
        { id: "tax_id_number", label: "Tax ID Number (PAN/TIN/etc.)", type: "input" },
        { id: "national_id", label: "National ID Number (if applicable)", type: "input" },
        { id: "filing_portal", label: "Tax Filing Portal URL and login", type: "input" },
      ]},
      { title: "Tax Professional", fields: [
        { id: "consultant_name", label: "Foreign Tax Consultant Name", type: "input" },
        { id: "consultant_phone", label: "Phone Number", type: "input" },
        { id: "consultant_email", label: "Email", type: "input" },
      ]},
      { title: "After Death", fields: [
        { id: "filing_needed", label: "Is tax filing needed after death in this country?", type: "textarea" },
        { id: "income_sources", label: "Foreign income sources that may require filing", type: "textarea" },
        { id: "tax_treaty", label: "Tax treaty implications with your country of residence", type: "textarea" },
      ]}
    ]
  },

  device_access: {
    title: "Device & Password Manager Access",
    icon: "\u{1F4F1}",
    sections: [
      { title: "Primary Device", fields: [
        { id: "device_type", label: "Device Type (Phone/Laptop/Tablet)", type: "input" },
        { id: "device_model", label: "Device Model", type: "input" },
        { id: "unlock_method", label: "Unlock Method (PIN/Password/Biometric)", type: "input" },
        { id: "pin_code", label: "PIN/Password (store in sealed envelope in safe)", type: "input" },
      ]},
      { title: "Password Manager", fields: [
        { id: "manager_name", label: "Password Manager (1Password/Bitwarden/etc.)", type: "input" },
        { id: "master_password_location", label: "Where is the master password stored?", type: "input", hint: "Should be in sealed envelope in fireproof safe" },
        { id: "emergency_access", label: "Emergency access procedure set up?", type: "textarea" },
        { id: "recovery_method", label: "Account recovery method", type: "textarea" },
      ]},
      { title: "Two-Factor Authentication", fields: [
        { id: "authenticator_app", label: "Which authenticator app? (Google Auth, Authy, etc.)", type: "input" },
        { id: "backup_codes_location", label: "Where are 2FA backup codes stored?", type: "input" },
        { id: "recovery_phone", label: "Recovery phone number", type: "input" },
        { id: "recovery_email", label: "Recovery email address", type: "input" },
      ]}
    ]
  },

  email_account: {
    title: "Email & Cloud Account Details",
    icon: "\u{1F4E7}",
    sections: [
      { title: "Account Details", fields: [
        { id: "provider", label: "Provider (Gmail, iCloud, etc.)", type: "input" },
        { id: "email_address", label: "Email Address", type: "input" },
        { id: "password_location", label: "Where is password stored?", type: "input" },
      ]},
      { title: "Cloud Storage", fields: [
        { id: "storage_plan", label: "Storage plan (free / paid - how much?)", type: "input" },
        { id: "payment_method", label: "Payment method for storage", type: "input" },
        { id: "important_files", label: "What important files are stored here?", type: "textarea" },
      ]},
      { title: "Legacy Settings", fields: [
        { id: "inactive_manager", label: "Google Inactive Account Manager set up?", type: "input" },
        { id: "legacy_contact", label: "Apple Legacy Contact set up?", type: "input" },
        { id: "trusted_person", label: "Who gets access after inactivity/death?", type: "input" },
      ]},
      { title: "After Death Instructions", fields: [
        { id: "keep_or_close", label: "Keep account active or close it?", type: "textarea" },
        { id: "important_emails", label: "Any important emails/threads to preserve?", type: "textarea" },
        { id: "linked_services", label: "Services that use this email for login", type: "textarea" },
      ]}
    ]
  },

  subscription: {
    title: "Subscription Service Details",
    icon: "\u{1F504}",
    sections: [
      { title: "Service Details", fields: [
        { id: "service_name", label: "Service Name", type: "input" },
        { id: "monthly_cost", label: "Monthly/Annual Cost", type: "input" },
        { id: "payment_method", label: "Payment Method (which card?)", type: "input" },
        { id: "billing_cycle", label: "Billing Cycle (Monthly/Annual)", type: "input" },
        { id: "login_email", label: "Login Email", type: "input" },
      ]},
      { title: "After Death Instructions", fields: [
        { id: "action", label: "Cancel, transfer, or keep?", type: "textarea" },
        { id: "family_uses", label: "Does the family use this service?", type: "input" },
        { id: "how_to_cancel", label: "How to cancel (URL/phone)", type: "textarea" },
        { id: "data_to_export", label: "Any data to export before cancelling?", type: "textarea" },
      ]}
    ]
  },

  social_media: {
    title: "Social Media Account Details",
    icon: "\u{1F310}",
    sections: [
      { title: "Account Details", fields: [
        { id: "platform", label: "Platform (Facebook, LinkedIn, etc.)", type: "input" },
        { id: "username", label: "Username / Profile URL", type: "input" },
        { id: "email_used", label: "Email used for login", type: "input" },
      ]},
      { title: "After Death Preference", fields: [
        { id: "action", label: "Preference: Memorialize, Delete, or Leave as-is?", type: "input" },
        { id: "legacy_contact", label: "Legacy contact set up on platform?", type: "input" },
        { id: "content_to_save", label: "Any content to download/preserve first?", type: "textarea" },
        { id: "memorialization_url", label: "Platform's memorialization request URL", type: "input" },
      ]}
    ]
  },

  digital_brain: {
    title: "Notion Digital Brain Access",
    icon: "\u{1F9E0}",
    sections: [
      { title: "Access Details", fields: [
        { id: "notion_email", label: "Notion account email", type: "input" },
        { id: "password_location", label: "Where is password stored?", type: "input" },
        { id: "workspace_name", label: "Workspace name", type: "input" },
      ]},
      { title: "Organization Guide", fields: [
        { id: "structure", label: "How is the Digital Brain organized? (top-level sections)", type: "textarea" },
        { id: "key_pages", label: "Most important pages for {partner} to access", type: "textarea" },
        { id: "backup_schedule", label: "Backup schedule and location", type: "textarea" },
      ]},
      { title: "After Death", fields: [
        { id: "keep_paying", label: "Keep subscription active? Payment method?", type: "textarea" },
        { id: "export_data", label: "How to export all data as backup", type: "textarea" },
      ]}
    ]
  },

  medical_provider: {
    title: "Medical Provider Details",
    icon: "\u{1FA7A}",
    sections: [
      { title: "Provider Details", fields: [
        { id: "provider_type", label: "Provider Type (PCP, Dentist, Specialist, etc.)", type: "input" },
        { id: "doctor_name", label: "Doctor's Full Name", type: "input" },
        { id: "practice_name", label: "Practice/Clinic Name", type: "input" },
        { id: "phone", label: "Phone Number", type: "input" },
        { id: "address", label: "Address", type: "textarea" },
        { id: "patient_portal", label: "Patient Portal URL", type: "input" },
      ]},
      { title: "For Each Family Member", fields: [
        { id: "who_sees", label: "Which family members see this doctor?", type: "input" },
        { id: "next_appointment", label: "Next scheduled appointment", type: "input" },
        { id: "insurance_accepted", label: "Insurance accepted?", type: "input" },
      ]}
    ]
  },

  medical_history: {
    title: "Medical History Details",
    icon: "\u{1F3E5}",
    sections: [
      { title: "Person Details", fields: [
        { id: "person_name", label: "Person's Name", type: "input" },
        { id: "blood_type", label: "Blood Type", type: "input" },
        { id: "allergies", label: "Known Allergies", type: "textarea" },
        { id: "current_medications", label: "Current Medications with Dosages", type: "textarea" },
      ]},
      { title: "Medical History", fields: [
        { id: "conditions", label: "Current/Chronic Conditions", type: "textarea" },
        { id: "surgeries", label: "Past Surgeries", type: "textarea" },
        { id: "vaccinations", label: "Vaccination Record Summary", type: "textarea" },
        { id: "family_history", label: "Relevant Family Medical History", type: "textarea" },
      ]},
      { title: "Records Location", fields: [
        { id: "records_location", label: "Where are medical records stored?", type: "input" },
        { id: "portal_access", label: "Patient portal access details", type: "input" },
      ]}
    ]
  },

  child_care: {
    title: "Child Care Details",
    icon: "\u{1F476}",
    sections: [
      { title: "School/Daycare", fields: [
        { id: "school_name", label: "School/Daycare Name", type: "input" },
        { id: "address", label: "Address", type: "textarea" },
        { id: "phone", label: "Phone Number", type: "input" },
        { id: "teacher_name", label: "Teacher/Caregiver Name", type: "input" },
        { id: "hours", label: "Hours (drop-off and pick-up times)", type: "input" },
      ]},
      { title: "Emergency & Pickup", fields: [
        { id: "authorized_pickup", label: "Authorized Pickup Persons (names + relationship)", type: "textarea" },
        { id: "emergency_contacts", label: "Emergency contacts on file at school", type: "textarea" },
        { id: "special_needs", label: "Special needs or accommodations", type: "textarea" },
      ]},
      { title: "Daily Routine", fields: [
        { id: "morning_routine", label: "Morning routine", type: "textarea" },
        { id: "evening_routine", label: "Evening/bedtime routine", type: "textarea" },
        { id: "dietary_needs", label: "Dietary preferences and allergies", type: "textarea" },
        { id: "comfort_items", label: "Comfort items and favorites", type: "textarea" },
      ]}
    ]
  },

  education_plan: {
    title: "Education Planning Details",
    icon: "\u{1F4DA}",
    sections: [
      { title: "Current Education", fields: [
        { id: "current_school", label: "Current school/program", type: "input" },
        { id: "grade_level", label: "Grade level", type: "input" },
        { id: "school_district", label: "School district", type: "input" },
      ]},
      { title: "Educational Wishes", fields: [
        { id: "philosophy", label: "Your educational philosophy for your child", type: "textarea" },
        { id: "school_preference", label: "Public vs Private school preference", type: "textarea" },
        { id: "extracurriculars", label: "Extracurricular activities you value", type: "textarea" },
        { id: "college_wishes", label: "College/university wishes", type: "textarea" },
      ]},
      { title: "Financial Planning", fields: [
        { id: "529_plan", label: "529 plan details (linked to Education Savings section)", type: "input" },
        { id: "annual_budget", label: "Annual education budget", type: "input" },
      ]}
    ]
  },

  legacy_letter: {
    title: "Legacy Letter / Memory Details",
    icon: "\u{1F48C}",
    sections: [
      { title: "Letter Details", fields: [
        { id: "recipient", label: "Who is this letter for?", type: "input" },
        { id: "occasion", label: "For what occasion/age? (e.g., 18th birthday, wedding)", type: "input" },
        { id: "date_written", label: "Date Written", type: "input" },
        { id: "format", label: "Format (Written letter, Video, Audio, Photo album)", type: "input" },
      ]},
      { title: "Content Summary", fields: [
        { id: "key_message", label: "Key message you want to convey", type: "textarea" },
        { id: "stories", label: "Stories or memories included", type: "textarea" },
        { id: "values", label: "Values you want to share", type: "textarea" },
      ]},
      { title: "Storage & Delivery", fields: [
        { id: "storage_location", label: "Where is this stored?", type: "input" },
        { id: "delivery_instructions", label: "When and how should this be delivered?", type: "textarea" },
        { id: "who_delivers", label: "Who is responsible for delivering this?", type: "input" },
      ]}
    ]
  },

  utility_account: {
    title: "Utility Account Details",
    icon: "\u{1F50C}",
    sections: [
      { title: "Account Details", fields: [
        { id: "utility_type", label: "Utility Type (Electric/Gas/Water/Internet/Phone)", type: "input" },
        { id: "provider", label: "Provider Name", type: "input" },
        { id: "account_number", label: "Account Number", type: "input" },
        { id: "phone", label: "Customer Service Phone", type: "input" },
        { id: "online_url", label: "Online Account URL", type: "input" },
      ]},
      { title: "Payment", fields: [
        { id: "monthly_cost", label: "Approximate Monthly Cost", type: "input" },
        { id: "auto_pay", label: "Auto-pay set up? From which account/card?", type: "input" },
        { id: "due_date", label: "Bill Due Date", type: "input" },
      ]},
      { title: "After Death Instructions", fields: [
        { id: "keep_active", label: "Keep active (Yes - house still needs utilities)", type: "input" },
        { id: "name_transfer", label: "How to transfer account name to survivor", type: "textarea" },
      ]}
    ]
  },

  keys_access: {
    title: "Keys & Access Code Details",
    icon: "\u{1F511}",
    sections: [
      { title: "Key/Code Details", fields: [
        { id: "item", label: "What does this key/code open?", type: "input" },
        { id: "type", label: "Type (Physical key, Combination, Code, Card)", type: "input" },
        { id: "code_value", label: "Code/Combination (if applicable)", type: "input" },
        { id: "location", label: "Where is the key/card kept?", type: "input" },
      ]},
      { title: "Spare & Backup", fields: [
        { id: "spare_location", label: "Where is the spare kept?", type: "input" },
        { id: "who_has_spare", label: "Who else has a copy?", type: "input" },
      ]}
    ]
  },

  home_maintenance: {
    title: "Home Maintenance / Service Provider",
    icon: "\u{1F527}",
    sections: [
      { title: "Provider Details", fields: [
        { id: "service_type", label: "Service Type (Plumber/Electrician/HVAC/etc.)", type: "input" },
        { id: "company_name", label: "Company Name", type: "input" },
        { id: "contact_name", label: "Contact Person", type: "input" },
        { id: "phone", label: "Phone Number", type: "input" },
        { id: "schedule", label: "Service Schedule (if recurring)", type: "input" },
      ]},
      { title: "Warranty Info", fields: [
        { id: "warranty_item", label: "What item/system is under warranty?", type: "input" },
        { id: "warranty_expiry", label: "Warranty expiry date", type: "input" },
        { id: "warranty_details", label: "Warranty coverage details", type: "textarea" },
      ]}
    ]
  },

  emergency_contact: {
    title: "Emergency Contact Details",
    icon: "\u{1F6A8}",
    sections: [
      { title: "Contact Information", fields: [
        { id: "name", label: "Full Name", type: "input" },
        { id: "relationship", label: "Relationship", type: "input" },
        { id: "phone", label: "Phone Number", type: "input" },
        { id: "alt_phone", label: "Alternate Phone / WhatsApp", type: "input" },
        { id: "email", label: "Email Address", type: "input" },
        { id: "address", label: "Address", type: "textarea" },
      ]},
      { title: "Role & Instructions", fields: [
        { id: "role", label: "Role in emergency (Attorney, Financial Advisor, Family, etc.)", type: "input" },
        { id: "when_to_call", label: "When should this person be contacted?", type: "textarea" },
        { id: "what_they_know", label: "What do they know about your affairs?", type: "textarea" },
        { id: "what_they_hold", label: "Do they hold any documents or keys?", type: "textarea" },
      ]}
    ]
  },

  first_48_hours: {
    title: "First 48 Hours Action Item",
    icon: "\u{23F0}",
    sections: [
      { title: "Action Details", fields: [
        { id: "action", label: "Action to take", type: "input" },
        { id: "who_does_it", label: "Who should do this?", type: "input" },
        { id: "deadline", label: "Deadline (e.g., within 24 hours, within 60 days)", type: "input" },
        { id: "phone_to_call", label: "Phone number to call", type: "input" },
      ]},
      { title: "Steps & Documents", fields: [
        { id: "step_by_step", label: "Step-by-step instructions", type: "textarea" },
        { id: "docs_needed", label: "Documents needed", type: "textarea" },
        { id: "notes", label: "Additional notes", type: "textarea" },
      ]}
    ]
  },

  first_30_days: {
    title: "First 30 Days Action Item",
    icon: "\u{1F4C5}",
    sections: [
      { title: "Action Details", fields: [
        { id: "action", label: "Action to take", type: "input" },
        { id: "who_does_it", label: "Who should do this?", type: "input" },
        { id: "priority", label: "Priority (1-10)", type: "input" },
      ]},
      { title: "Instructions", fields: [
        { id: "how_to", label: "How to complete this action", type: "textarea" },
        { id: "contacts", label: "Who to contact", type: "textarea" },
        { id: "follow_up", label: "Follow-up actions needed", type: "textarea" },
      ]}
    ]
  },

  funeral_wishes: {
    title: "Funeral & Memorial Preferences",
    icon: "\u{1F54A}\uFE0F",
    sections: [
      { title: "Preferences", fields: [
        { id: "cremation_burial", label: "Cremation or Burial?", type: "input" },
        { id: "location", label: "Preferred location (ashes scattering / burial site)", type: "textarea" },
        { id: "ceremony_type", label: "Type of ceremony (religious, secular, celebration of life)", type: "input" },
        { id: "cultural_rites", label: "Hindu/cultural rites preferences", type: "textarea" },
      ]},
      { title: "Memorial Details", fields: [
        { id: "music", label: "Music preferences for service", type: "textarea" },
        { id: "readings", label: "Readings or poems", type: "textarea" },
        { id: "speakers", label: "Who should speak at the service?", type: "textarea" },
        { id: "donations", label: "In lieu of flowers, donations to...", type: "textarea" },
      ]},
      { title: "Practical Details", fields: [
        { id: "funeral_home", label: "Preferred funeral home (if any)", type: "input" },
        { id: "prepaid", label: "Any pre-paid arrangements?", type: "input" },
        { id: "obituary_wishes", label: "Obituary preferences", type: "textarea" },
        { id: "notify_list", label: "Who should be notified", type: "textarea" },
      ]}
    ]
  },

  personal_history: {
    title: "Personal History & Family Story",
    icon: "\u{1F4D6}",
    sections: [
      { title: "Family Heritage", fields: [
        { id: "family_origin", label: "Family origin and ancestral history", type: "textarea" },
        { id: "important_stories", label: "Important family stories to pass on", type: "textarea" },
        { id: "traditions", label: "Cultural traditions to maintain", type: "textarea" },
        { id: "recipes", label: "Family recipes or customs", type: "textarea" },
      ]},
      { title: "Personal Legacy", fields: [
        { id: "life_lessons", label: "Most important life lessons", type: "textarea" },
        { id: "proudest_moments", label: "Proudest moments", type: "textarea" },
        { id: "wishes_for_family", label: "Wishes for the family's future", type: "textarea" },
      ]}
    ]
  },

  ethical_will: {
    title: "Ethical Will / Letter of Values",
    icon: "\u{2764}\uFE0F",
    sections: [
      { title: "Your Values", fields: [
        { id: "core_values", label: "Your core values", type: "textarea" },
        { id: "life_philosophy", label: "Your life philosophy", type: "textarea" },
        { id: "gratitude", label: "Who are you most grateful for and why?", type: "textarea" },
      ]},
      { title: "For Your Family", fields: [
        { id: "to_spouse", label: "Message to {partner}", type: "textarea" },
        { id: "to_child", label: "Message to {firstChild}", type: "textarea" },
        { id: "to_family", label: "Message to extended family", type: "textarea" },
        { id: "hopes", label: "Your hopes for the family's future", type: "textarea" },
      ]}
    ]
  },

  employer: {
    title: "Employer / Employment Details",
    icon: "\u{1F3E2}",
    sections: [
      { title: "Employment Details", fields: [
        { id: "company", label: "Company Name", type: "input" },
        { id: "employee_id", label: "Employee ID", type: "input" },
        { id: "title", label: "Job Title", type: "input" },
        { id: "start_date", label: "Employment Start Date", type: "input" },
        { id: "manager_name", label: "Manager Name", type: "input" },
        { id: "manager_contact", label: "Manager Contact (phone/email)", type: "input" },
      ]},
      { title: "HR & Benefits Contacts", fields: [
        { id: "hr_contact", label: "HR Contact for Bereavement", type: "input" },
        { id: "hr_phone", label: "HR Phone Number", type: "input" },
        { id: "benefits_portal", label: "Benefits Portal URL", type: "input" },
      ]},
      { title: "Death Benefits", fields: [
        { id: "life_insurance", label: "Employer life insurance details", type: "textarea" },
        { id: "death_benefit", label: "Special death benefit (if any)", type: "textarea" },
        { id: "final_paycheck", label: "Final paycheck / PTO payout process", type: "textarea" },
        { id: "equity_treatment", label: "How is unvested equity treated at death?", type: "textarea" },
      ]}
    ]
  },

  side_project: {
    title: "Side Project / IP Details",
    icon: "\u{1F4BB}",
    sections: [
      { title: "Project Details", fields: [
        { id: "project_name", label: "Project Name", type: "input" },
        { id: "description", label: "Brief Description", type: "textarea" },
        { id: "platform", label: "Platform (GitHub, Blog, Domain, etc.)", type: "input" },
        { id: "url", label: "URL", type: "input" },
      ]},
      { title: "Access & Revenue", fields: [
        { id: "login", label: "Login credentials location", type: "input" },
        { id: "generates_revenue", label: "Does it generate revenue? How much?", type: "textarea" },
        { id: "hosting_cost", label: "Monthly hosting/domain cost", type: "input" },
      ]},
      { title: "After Death Instructions", fields: [
        { id: "action", label: "Keep running, archive, or shut down?", type: "textarea" },
        { id: "domain_renewal", label: "Domain renewal date and registrar", type: "input" },
      ]}
    ]
  },

  mortgage: {
    title: "Mortgage Details",
    icon: "\u{1F3E0}",
    sections: [
      { title: "Loan Details", fields: [
        { id: "lender", label: "Lender Name", type: "input" },
        { id: "account_number", label: "Loan Account Number", type: "input" },
        { id: "original_amount", label: "Original Loan Amount", type: "input" },
        { id: "current_balance", label: "Current Outstanding Balance", type: "input" },
        { id: "interest_rate", label: "Interest Rate", type: "input" },
        { id: "loan_type", label: "Loan Type (30yr Fixed, ARM, etc.)", type: "input" },
        { id: "monthly_payment", label: "Monthly Payment (P&I + Escrow)", type: "input" },
      ]},
      { title: "Payment Details", fields: [
        { id: "due_date", label: "Monthly Due Date", type: "input" },
        { id: "auto_pay", label: "Auto-pay set up? From which account?", type: "input" },
        { id: "payoff_date", label: "Expected Payoff Date", type: "input" },
        { id: "escrow_covers", label: "What does escrow cover? (Tax, Insurance)", type: "textarea" },
      ]},
      { title: "After Death Instructions", fields: [
        { id: "continues", label: "Mortgage continues - NOT due in full at death", type: "textarea" },
        { id: "contact_lender", label: "Contact lender to update account holder name", type: "textarea" },
        { id: "refinance_option", label: "Consider refinancing to spouse's name", type: "textarea" },
      ]}
    ]
  },

  loan: {
    title: "Loan / Debt Details",
    icon: "\u{1F4B0}",
    sections: [
      { title: "Loan Details", fields: [
        { id: "lender", label: "Lender / Creditor", type: "input" },
        { id: "loan_type", label: "Loan Type (401k loan, Student, Personal, Auto)", type: "input" },
        { id: "account_number", label: "Account Number", type: "input" },
        { id: "original_amount", label: "Original Amount", type: "input" },
        { id: "current_balance", label: "Current Balance", type: "input" },
        { id: "monthly_payment", label: "Monthly Payment", type: "input" },
        { id: "interest_rate", label: "Interest Rate", type: "input" },
      ]},
      { title: "After Death Treatment", fields: [
        { id: "forgiven_at_death", label: "Is this debt forgiven at death?", type: "textarea", hint: "Federal student loans: yes. 401k loans: become taxable. Private loans: paid from estate." },
        { id: "who_pays", label: "Who is responsible for this debt?", type: "textarea" },
        { id: "insurance_coverage", label: "Any loan insurance/protection?", type: "textarea" },
      ]}
    ]
  }
};
