export const SHORT_CODE_MAP: Record<string, string> = {
  // Groups
  "All Staff": "ALL",
  "grp-all-staff": "ALL",
  "All Branch Managers": "BM",
  "grp-branch-managers": "BM",
  "Finance Department": "FD",
  "grp-finance": "FD",
  "Finance": "FD",
  "Management": "MGMT",
  "grp-management": "MGMT",
  "Operations Team": "OPS",
  "grp-operations": "OPS",
  "Operations": "OPS",
  "Human Resources": "HR",
  "Human Resources Department": "HR",
  "grp-hr": "HR",
  "IT & Cybersecurity": "IT",
  "grp-it": "IT",
  "Compliance & Legal": "COMP",
  "grp-compliance": "COMP",
  "Credit & Lending": "CR",
  "grp-credit": "CR",
  "Internal Audit": "AUD",
  "grp-audit": "AUD",
  "Marketing & Communications": "MKT",
  "grp-marketing": "MKT",

  // Users
  "Sarah Lin": "SL",
  "user-sarah": "SL",
  "David Miller": "DM",
  "user-david": "DM",
  "Alex Vorn": "AV",
  "user-alex": "AV",
  "Emily Tan": "ET",
  "user-emily": "ET",
  "Sreyneath Keo": "SK",
  "user-sreyneath": "SK",
  "Sokha Chan": "SC",
  "user-sokha": "SC",
  "Dara Pich": "DP",
  "user-dara": "DP",
  "Bopha Meng": "BM",
  "user-bopha": "BM",
  "Vichea Chea": "VC",
  "user-vichea": "VC",
  "Kalyan Roeun": "KR",
  "user-kalyan": "KR",
  "Rithy Sen": "RS",
  "user-rithy": "RS",
  "Sovann Kong": "SK",
  "user-sovann": "SK",
}

export const FALLBACK_GROUP_NAMES: Record<string, string> = {
  "grp-all-staff": "All Staff",
  "grp-branch-managers": "All Branch Managers",
  "grp-finance": "Finance Department",
  "grp-management": "Management",
  "grp-operations": "Operations Team",
  "grp-hr": "Human Resources",
  "grp-it": "IT & Cybersecurity",
  "grp-compliance": "Compliance & Legal",
  "grp-credit": "Credit & Lending",
  "grp-audit": "Internal Audit",
  "grp-marketing": "Marketing & Communications",
  "grp-portal-admins": "IT Administration",
  "All Branch Managers": "All Branch Managers",
  "Finance Department": "Finance Department",
  "Management": "Management",
  "Operations Team": "Operations Team",
  "All Staff": "All Staff",
  "user-alex": "Alex Vorn",
  "user-david": "David Miller",
  "user-emily": "Emily Tan",
  "user-sarah": "Sarah Lin",
  "user-sreyneath": "Sreyneath Keo",
  "user-sokha": "Sokha Chan",
  "user-dara": "Dara Pich",
  "user-bopha": "Bopha Meng",
  "user-vichea": "Vichea Chea",
  "user-kalyan": "Kalyan Roeun",
  "user-rithy": "Rithy Sen",
  "user-sovann": "Sovann Kong",
}

export function getShortRecipientCode(target?: string): string {
  if (!target) return "ALL"
  if (SHORT_CODE_MAP[target]) return SHORT_CODE_MAP[target]
  const fullName = FALLBACK_GROUP_NAMES[target]
  if (fullName && SHORT_CODE_MAP[fullName]) return SHORT_CODE_MAP[fullName]

  const words = (fullName || target).trim().split(/\s+/)
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase()
  }
  return (fullName || target).slice(0, 3).toUpperCase()
}

export function getFullRecipientName(target?: string): string {
  if (!target) return "All Staff"
  return FALLBACK_GROUP_NAMES[target] || target
}
