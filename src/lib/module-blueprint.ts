export type ModuleScope = {
  module: string;
  submodules: Array<{ name: string; screens: string[] }>;
};

export const adminModuleScopeBySection: Record<string, ModuleScope> = {
  dashboard: {
    module: "Admin Command Center",
    submodules: [
      { name: "Overview", screens: ["KPI Board", "Activity Feed", "Pending Approvals"] },
      { name: "Analytics", screens: ["Revenue Trend", "Attendance Trend", "Performance Trend"] },
    ],
  },
  reception: {
    module: "Admin Operations",
    submodules: [
      { name: "Admissions Desk", screens: ["Applications", "Document Review", "Interview Queue"] },
      { name: "Enrollment", screens: ["Approval", "Class Placement", "Parent Account Creation"] },
      { name: "Front Desk", screens: ["Visitor Log", "Follow-up Tasks", "Intake Notes"] },
    ],
  },
  students: {
    module: "Admin Operations",
    submodules: [
      { name: "Student Directory", screens: ["Student List", "Advanced Filters", "Bulk Actions"] },
      { name: "Student Profile", screens: ["Bio", "Academics", "Attendance", "Payments"] },
      { name: "Promotion", screens: ["Promote by Class", "Promote by Session", "Alumni"] },
    ],
  },
  parents: {
    module: "Admin Operations",
    submodules: [
      { name: "Parent Directory", screens: ["Parent List", "Linked Children", "Account Status"] },
      { name: "Engagement", screens: ["Messages", "Complaints", "Announcements"] },
    ],
  },
  teachers: {
    module: "Admin Operations",
    submodules: [
      { name: "Staff Directory", screens: ["Teachers", "Roles", "Permissions"] },
      { name: "Workload", screens: ["Class Assignment", "Subject Assignment", "Timetable Load"] },
    ],
  },
  academics: {
    module: "Academics",
    submodules: [
      { name: "Calendar", screens: ["Session Setup", "Term Setup", "Active Context"] },
      { name: "Class Builder", screens: ["Classes", "Arms", "Class Streams"] },
      { name: "Curriculum", screens: ["Subjects", "Subject Allocation", "Assessment Structure"] },
      { name: "Timetable", screens: ["Builder", "Class View", "Teacher View"] },
    ],
  },
  classes: {
    module: "Academics",
    submodules: [
      { name: "Class Setup", screens: ["Create Class", "Add Arms", "Class Capacity"] },
      { name: "Arm Subject Mapping", screens: ["Assign Subjects", "Per Arm Subject Rules", "Teacher Binding"] },
    ],
  },
  subjects: {
    module: "Academics",
    submodules: [
      { name: "Subject Registry", screens: ["Create Subject", "Edit Subject", "Archive Subject"] },
      { name: "Allocation", screens: ["By Class", "By Arm", "By Teacher"] },
    ],
  },
  attendance: {
    module: "Academics",
    submodules: [
      { name: "Attendance", screens: ["Daily Capture", "History", "Exceptions"] },
      { name: "Reports", screens: ["Class Summary", "Student Trend", "Late Index"] },
    ],
  },
  results: {
    module: "Academics",
    submodules: [
      { name: "Result Engine", screens: ["Assessment Weights", "Grading Bands", "Computation"] },
      { name: "Approvals", screens: ["Draft Review", "Publish", "Lock Results"] },
      { name: "Report Cards", screens: ["Template", "Preview", "Export PDF"] },
    ],
  },
  lms: {
    module: "Academics",
    submodules: [
      { name: "Content", screens: ["Lessons", "Assignments", "Quizzes"] },
      { name: "Delivery", screens: ["Online Classes", "Class Feed", "Submission Tracking"] },
    ],
  },
  fees: {
    module: "Finance",
    submodules: [
      { name: "Fee Group", screens: ["Create Group", "Group Rules", "Activation"] },
      { name: "Fee Structure", screens: ["By Class", "By Arm", "By Term"] },
      { name: "Concession", screens: ["Discount", "Scholarship", "Waiver"] },
    ],
  },
  finance: {
    module: "Finance",
    submodules: [
      { name: "Billing Engine", screens: ["Generate Bills", "Installment Plan", "Debtors"] },
      { name: "Collection", screens: ["Payments", "Approvals", "Reconciliation"] },
      { name: "Reports", screens: ["Revenue", "Outstanding", "Ledger"] },
    ],
  },
  invoices: {
    module: "Finance",
    submodules: [
      { name: "Invoice Processing", screens: ["Create Invoice", "Issue Invoice", "Invoice History"] },
      { name: "Invoice Documents", screens: ["Branding", "Payment Instructions", "QR Validation"] },
    ],
  },
  payments: {
    module: "Finance",
    submodules: [
      { name: "Payment Desk", screens: ["Payment Records", "Approval Queue", "Receipt Validation"] },
      { name: "Reconciliation", screens: ["Channel Match", "Exceptions", "Ledger Sync"] },
    ],
  },
  announcements: {
    module: "Communication",
    submodules: [
      { name: "Broadcast", screens: ["Announcements", "Audience Targeting", "Delivery Log"] },
      { name: "Direct Messaging", screens: ["Parent Messages", "Staff Notices", "Templates"] },
    ],
  },
  transport: {
    module: "Admin Operations",
    submodules: [
      { name: "Driver Management", screens: ["Driver List", "Profile", "Availability"] },
      { name: "Route Management", screens: ["Routes", "Stops", "Pickup Plan"] },
      { name: "Fleet", screens: ["Vehicle Registry", "Maintenance", "Compliance"] },
    ],
  },
  settings: {
    module: "System Settings",
    submodules: [
      { name: "Configuration Engine", screens: ["Sessions", "Terms", "Classes", "Arms", "Subjects", "Fees"] },
      { name: "Branding", screens: ["Logo", "Colors", "Document Theme"] },
      { name: "Portal Controls", screens: ["Visibility", "Roles", "Notification Rules"] },
    ],
  },
};
