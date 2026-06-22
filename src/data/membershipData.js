export const memberTypes = [
  { id: "varganidaar", emoji: "👨‍💼", title: "Varganidaar", subtitle: "वर्गणीदार · Collector/Member" },
  { id: "cooperative", emoji: "🤝", title: "Cooperative Member", subtitle: "सहकारी सभासद" },
  { id: "donor", emoji: "💛", title: "Donor", subtitle: "देनगीदार · Benefactor" },
  { id: "committee", emoji: "🎭", title: "Committee Member", subtitle: "सभासद" },
];

// Phase 1 demo record — Phase 2 will fetch this from Firestore by member ID / mobile
export const demoMember = {
  id: "LSUM-2024-0842",
  name: "Suresh Ramchandra Patil",
  ward: "Lalbaug East",
  since: 2009,
  previousDues: [
    { type: "Annual Vargani 2024–25", desc: "Membership subscription", due: "31 July 2024", fine: 50, total: 550, status: "Overdue" },
    { type: "Ganeshotsav Chanda 2024", desc: "Festival contribution", due: "15 Aug 2024", fine: 50, total: 1050, status: "Overdue" },
    { type: "Registration 2024–25", desc: "Annual card renewal", due: "01 June 2024", fine: 0, total: 200, status: "Paid" },
    { type: "Ganeshotsav Chanda 2023", desc: "Festival contribution", due: "15 Aug 2023", fine: 0, total: 900, status: "Paid" },
  ],
  currentDues: [
    { type: "Annual Vargani", desc: "Membership subscription", due: "31 July 2025", amount: 500, status: "Pending" },
    { type: "Ganeshotsav Chanda", desc: "Festival contribution", due: "15 Aug 2025", amount: 1100, status: "Pending" },
    { type: "Registration Renewal", desc: "Membership card renewal", due: "01 June 2025", amount: 200, status: "Pending" },
  ],
};

export const previousOutstanding = 1600;
export const currentDuesTotal = 1800;
export const grandTotal = previousOutstanding + currentDuesTotal;
