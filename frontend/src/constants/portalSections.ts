export interface PortalCardItem {
  id: string
  title: string
  source: string
  author: string
  date: string
  fileType: "PDF" | "DOC"
  thumbnailKind: "proposal" | "interest-rate" | "khqr-promo" | "visa-promo"
}

export const NEWS_ITEMS: PortalCardItem[] = [
  {
    id: "news-1",
    title: "Proposal Portal Search for News and Announcements",
    source: "Web Portal POC",
    author: "Dev Admin",
    date: "November 12, 2026",
    fileType: "DOC",
    thumbnailKind: "proposal",
  },
  {
    id: "news-2",
    title: "Savings Interest Rate_Effective on 14-August-2026 (POC)",
    source: "Web Portal POC",
    author: "Dev Admin",
    date: "November 12, 2026",
    fileType: "PDF",
    thumbnailKind: "interest-rate",
  },
  {
    id: "news-3",
    title: "General Merchant Promotion (POC)",
    source: "Web Portal POC",
    author: "Dev Admin",
    date: "November 12, 2026",
    fileType: "PDF",
    thumbnailKind: "khqr-promo",
  },
  {
    id: "news-4",
    title: "Q4 Branch Operations & Vault Compliance Guide",
    source: "Web Portal POC",
    author: "Dev Admin",
    date: "November 10, 2026",
    fileType: "PDF",
    thumbnailKind: "visa-promo",
  },
  {
    id: "news-5",
    title: "Mobile Banking Scheduled Maintenance Briefing",
    source: "Web Portal POC",
    author: "Dev Admin",
    date: "November 8, 2026",
    fileType: "DOC",
    thumbnailKind: "proposal",
  },
  {
    id: "news-6",
    title: "Updated Foreign Exchange Board Rate Summary",
    source: "Web Portal POC",
    author: "Dev Admin",
    date: "November 5, 2026",
    fileType: "PDF",
    thumbnailKind: "interest-rate",
  },
]

export const GENERAL_ANNOUNCEMENTS_ITEMS: PortalCardItem[] = [
  {
    id: "gen-1",
    title: "Savings Interest Rate_Effective on 14-August-2026 (POC)",
    source: "Web Portal POC",
    author: "Dev Admin",
    date: "November 12, 2026",
    fileType: "PDF",
    thumbnailKind: "interest-rate",
  },
  {
    id: "gen-2",
    title: "General Merchant Promotion (POC)",
    source: "Web Portal POC",
    author: "Dev Admin",
    date: "November 12, 2026",
    fileType: "PDF",
    thumbnailKind: "khqr-promo",
  },
  {
    id: "gen-3",
    title: "On going promotion from Woori Visa Card (POC)",
    source: "Web Portal POC",
    author: "Dev Admin",
    date: "November 12, 2026",
    fileType: "PDF",
    thumbnailKind: "visa-promo",
  },
  {
    id: "gen-4",
    title: "Year-End Public Holiday Branch Opening Schedule",
    source: "Web Portal POC",
    author: "Dev Admin",
    date: "November 9, 2026",
    fileType: "DOC",
    thumbnailKind: "proposal",
  },
  {
    id: "gen-5",
    title: "Fixed Deposit Promotional Interest Update",
    source: "Web Portal POC",
    author: "Dev Admin",
    date: "November 6, 2026",
    fileType: "PDF",
    thumbnailKind: "interest-rate",
  },
  {
    id: "gen-6",
    title: "Merchant QR Settlement Policy Guidelines",
    source: "Web Portal POC",
    author: "Dev Admin",
    date: "November 3, 2026",
    fileType: "PDF",
    thumbnailKind: "visa-promo",
  },
]

