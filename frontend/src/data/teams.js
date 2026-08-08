export const initialTeams = [
  {
    id: "team-1",
    slug: "registration",
    name: "Registration Team",
    iconName: "UserCheck",
    lead: {
      name: "Diya Shah",
      role: "Registration Lead",
      avatar: "https://i.pravatar.cc/96?img=5",
      initials: "DS",
      email: "diya.shah@convene.edu",
      phone: "+91 98765 10001"
    },
    status: "Active",
    responsibilitySummary: "Manages check-ins, badge printing, participant helpdesk and QR lanyards.",
    activeTasksCount: 14,
    completedTasksCount: 38,
    totalTasksCount: 52,
    members: [
      { name: "Diya Shah", role: "Team Lead", avatar: "https://i.pravatar.cc/96?img=5", initials: "DS", email: "diya.shah@convene.edu", phone: "+91 98765 10001", assignedTasks: 4 },
      { name: "Aarav Kapoor", role: "Desk Manager", avatar: "https://i.pravatar.cc/96?img=3", initials: "AK", email: "aarav.kapoor@convene.edu", phone: "+91 98765 10002", assignedTasks: 3 },
      { name: "Meera Menon", role: "QR Scanner Operator", avatar: "https://i.pravatar.cc/96?img=9", initials: "MM", email: "meera.menon@convene.edu", phone: "+91 98765 10003", assignedTasks: 2 },
      { name: "Tara Sethi", role: "Badge Printing Crew", avatar: "https://i.pravatar.cc/96?img=20", initials: "TS", email: "tara.sethi@convene.edu", phone: "+91 98765 10004", assignedTasks: 3 },
      { name: "Rohan Nair", role: "VIP Desk Assistant", avatar: "https://i.pravatar.cc/96?img=12", initials: "RN", email: "rohan.nair@convene.edu", phone: "+91 98765 10005", assignedTasks: 2 },
      { name: "Kabir Mehta", role: "Helpdesk Support", avatar: "https://i.pravatar.cc/96?img=15", initials: "KM", email: "kabir.mehta@convene.edu", phone: "+91 98765 10006", assignedTasks: 1 }
    ],
    responsibilities: [
      "Manage online & on-site attendee check-ins",
      "Issue official QR badge lanyards & welcome kits",
      "Resolve participant registration inquiries",
      "Maintain real-time check-in sync stats"
    ],
    todayTasks: [
      { id: "TASK-101", title: "Setup Registration Desk & QR Scanners", status: "In Progress", dueTime: "08:30 AM", priority: "Critical" },
      { id: "TASK-109", title: "Issue Pre-printed VIP Lanyards", status: "Todo", dueTime: "09:15 AM", priority: "High" },
      { id: "TASK-110", title: "Sync Tablet Scanners with API Server", status: "Completed", dueTime: "08:00 AM", priority: "Medium" }
    ],
    upcomingDuties: [
      "Setup Lanes 1-4 tablet scanners at Entrance Gate",
      "Prepare VIP lanyard batch for Keynote Speakers",
      "Handover shift log to Evening registration crew"
    ],
    resources: [
      { name: "Registration Master DB", type: "Sheet" },
      { name: "Check-in Protocol PDF", type: "Doc" }
    ],
    inventory: [
      { name: "Thermal Badge Printers", type: "Printer", status: "Active" },
      { name: "Tablet Scanners", type: "Tablet", status: "Deployed" }
    ],
    activity: [
      { id: "act-1", user: "Diya Shah", action: "completed Registration Desk Setup", timestamp: "20 mins ago" },
      { id: "act-2", user: "Aarav Kapoor", action: "assigned 2 badge printer rolls", timestamp: "45 mins ago" }
    ]
  },
  {
    id: "team-2",
    slug: "design",
    name: "Design Team",
    iconName: "Palette",
    lead: {
      name: "Sara Sethi",
      role: "Lead Designer",
      avatar: "https://i.pravatar.cc/96?img=44",
      initials: "SS",
      email: "sara.sethi@convene.edu",
      phone: "+91 98765 90001"
    },
    status: "Active",
    responsibilitySummary: "Handles posters, branding, certificate templates, social media assets and stage visual graphics.",
    activeTasksCount: 12,
    completedTasksCount: 40,
    totalTasksCount: 52,
    members: [
      { name: "Sara Sethi", role: "Creative Director", avatar: "https://i.pravatar.cc/96?img=44", initials: "SS", email: "sara.sethi@convene.edu", phone: "+91 98765 90001", assignedTasks: 4 },
      { name: "Tara Sethi", role: "UI & Motion Designer", avatar: "https://i.pravatar.cc/96?img=20", initials: "TS", email: "tara.sethi@convene.edu", phone: "+91 98765 90002", assignedTasks: 3 },
      { name: "Meera Menon", role: "Brand & Print Specialist", avatar: "https://i.pravatar.cc/96?img=9", initials: "MM", email: "meera.menon@convene.edu", phone: "+91 98765 90003", assignedTasks: 3 },
      { name: "Anika Bose", role: "Visual Content Artist", avatar: "https://i.pravatar.cc/96?img=36", initials: "AB", email: "anika.bose@convene.edu", phone: "+91 98765 90004", assignedTasks: 2 }
    ],
    responsibilities: [
      "Design official event posters & digital banners",
      "Produce social media graphics & promo kits",
      "Format stage lower-thirds & LED backdrop loops",
      "Create winner certificate vector templates"
    ],
    todayTasks: [
      { id: "TASK-103", title: "Print & Stamp Finalist Certificates", status: "Completed", dueTime: "09:15 AM", priority: "High" },
      { id: "TASK-112", title: "Export Stage 1 LED Screen Motion Loop", status: "In Progress", dueTime: "11:00 AM", priority: "High" },
      { id: "TASK-113", title: "Design Keynote Speaker Quote Cards", status: "Todo", dueTime: "02:30 PM", priority: "Medium" }
    ],
    upcomingDuties: [
      "Finalize Winner Certificate Vector Templates",
      "Export Closing Ceremony LED Screen Background Loop",
      "Verify stage presentation typography scaling"
    ],
    resources: [
      { name: "Convene Brand Kit 2026", type: "Figma" },
      { name: "Official Logo SVG Package", type: "Assets" },
      { name: "Canva Social Templates", type: "Canva" }
    ],
    inventory: [
      { name: "Apple MacBook Pro M3 Max", type: "Laptop", status: "In Use" },
      { name: "Wacom Cintiq Drawing Tablet", type: "Drawing Tablet", status: "Active" }
    ],
    activity: [
      { id: "act-1", user: "Sara Sethi", action: "exported Winner Certificate Templates", timestamp: "40 mins ago" },
      { id: "act-2", user: "Rahul", action: "completed Banner Design", timestamp: "1 hour ago" },
      { id: "act-3", user: "Aman Goel", action: "uploaded sponsor logo asset pack", timestamp: "2 hours ago" }
    ]
  },
  {
    id: "team-3",
    slug: "technical",
    name: "Technical Team",
    iconName: "Cpu",
    lead: {
      name: "Ishaan Bose",
      role: "Tech Lead",
      avatar: "https://i.pravatar.cc/96?img=25",
      initials: "IB",
      email: "ishaan.bose@convene.edu",
      phone: "+91 98765 20001"
    },
    status: "Active",
    responsibilitySummary: "Controls venue WiFi access points, main stage projectors, audio routing and streaming encoders.",
    activeTasksCount: 8,
    completedTasksCount: 45,
    totalTasksCount: 53,
    members: [
      { name: "Ishaan Bose", role: "Tech Director", avatar: "https://i.pravatar.cc/96?img=25", initials: "IB", email: "ishaan.bose@convene.edu", phone: "+91 98765 20001", assignedTasks: 3 },
      { name: "Vihaan Gupta", role: "Network Engineer", avatar: "https://i.pravatar.cc/96?img=33", initials: "VG", email: "vihaan.gupta@convene.edu", phone: "+91 98765 20002", assignedTasks: 2 },
      { name: "Sara Sethi", role: "AV Specialist", avatar: "https://i.pravatar.cc/96?img=44", initials: "SS", email: "sara.sethi@convene.edu", phone: "+91 98765 20003", assignedTasks: 2 },
      { name: "Reyansh Ahuja", role: "Live Stream Tech", avatar: "https://i.pravatar.cc/96?img=52", initials: "RA", email: "reyansh.ahuja@convene.edu", phone: "+91 98765 20004", assignedTasks: 1 }
    ],
    responsibilities: [
      "Maintain main venue dedicated 1Gbps WiFi access points",
      "Calibrate Main Stage 4K projectors & wireless mics",
      "Manage live streaming servers to YouTube & Twitch",
      "Provide technical troubleshooting for hackathon participants"
    ],
    todayTasks: [
      { id: "TASK-107", title: "Main Stage Projector & Wireless Mic Test", status: "Completed", dueTime: "08:00 AM", priority: "Critical" },
      { id: "TASK-115", title: "Monitor Wi-Fi load across Lab A-D", status: "In Progress", dueTime: "12:00 PM", priority: "High" }
    ],
    upcomingDuties: [
      "Run Stage Audio Loop & Wireless Frequency sweep",
      "Monitor Wi-Fi load across Lab A-D during hacking peak",
      "Backup portal DB snapshot at 06:00 PM"
    ],
    resources: [
      { name: "Network Access Config JSON", type: "Config" },
      { name: "Streaming OBS Server Preset", type: "OBS" }
    ],
    inventory: [
      { name: "Enterprise Access Points", type: "Network", status: "Active" },
      { name: "HDMI Matrix Switcher", type: "AV Hardware", status: "In Use" }
    ],
    activity: [
      { id: "act-1", user: "Ishaan Bose", action: "calibrated Stage 1 Mics", timestamp: "15 mins ago" },
      { id: "act-2", user: "Vihaan Gupta", action: "boosted Wi-Fi bandwidth for Lab B", timestamp: "30 mins ago" }
    ]
  },
  {
    id: "team-4",
    slug: "marketing",
    name: "Marketing Team",
    iconName: "Megaphone",
    lead: {
      name: "Meera Menon",
      role: "Marketing Manager",
      avatar: "https://i.pravatar.cc/96?img=9",
      initials: "MM",
      email: "meera.menon@convene.edu",
      phone: "+91 98765 40001"
    },
    status: "Active",
    responsibilitySummary: "Manages social media coverage, press passes, live announcement bulletins and audience outreach.",
    activeTasksCount: 6,
    completedTasksCount: 32,
    totalTasksCount: 38,
    members: [
      { name: "Meera Menon", role: "Head of Marketing", avatar: "https://i.pravatar.cc/96?img=9", initials: "MM", email: "meera.menon@convene.edu", phone: "+91 98765 40001", assignedTasks: 2 },
      { name: "Diya Shah", role: "Social Media Lead", avatar: "https://i.pravatar.cc/96?img=5", initials: "DS", email: "diya.shah@convene.edu", phone: "+91 98765 40002", assignedTasks: 2 },
      { name: "Rohan Nair", role: "Content Copywriter", avatar: "https://i.pravatar.cc/96?img=12", initials: "RN", email: "rohan.nair@convene.edu", phone: "+91 98765 40003", assignedTasks: 2 }
    ],
    responsibilities: [
      "Publish real-time social media updates & key highlight reels",
      "Manage press passes & media interviews",
      "Distribute official digital press kits & event schedules",
      "Monitor event hashtag engagement & community feedback"
    ],
    todayTasks: [
      { id: "TASK-118", title: "Publish Opening Keynote Recap Reel", status: "Completed", dueTime: "11:30 AM", priority: "High" },
      { id: "TASK-119", title: "Draft Evening Announcement Bulletin", status: "In Progress", dueTime: "05:00 PM", priority: "Medium" }
    ],
    upcomingDuties: [
      "Publish Opening Keynote recap reel at 11:30 AM",
      "Interview Keynote Speaker in Press Booth 2",
      "Draft evening announcement bulletin"
    ],
    resources: [
      { name: "Social Media Editorial Calendar", type: "Notion" },
      { name: "Press Release Kit 2026", type: "PDF" }
    ],
    inventory: [
      { name: "Media Press Badges", type: "Badges", status: "Active" }
    ],
    activity: [
      { id: "act-1", user: "Meera Menon", action: "published Keynote Highlight Reel", timestamp: "5 mins ago" },
      { id: "act-2", user: "Priya", action: "assigned Instagram Post", timestamp: "45 mins ago" }
    ]
  },
  {
    id: "team-5",
    slug: "hospitality",
    name: "Hospitality Team",
    iconName: "Utensils",
    lead: {
      name: "Aarav Kapoor",
      role: "Hospitality Lead",
      avatar: "https://i.pravatar.cc/96?img=3",
      initials: "AK",
      email: "aarav.kapoor@convene.edu",
      phone: "+91 98765 30001"
    },
    status: "Busy",
    responsibilitySummary: "Coordinates catering services, mentor lounges, dietary food desks and participant hostel block rooms.",
    activeTasksCount: 16,
    completedTasksCount: 28,
    totalTasksCount: 44,
    members: [
      { name: "Aarav Kapoor", role: "Hospitality Manager", avatar: "https://i.pravatar.cc/96?img=3", initials: "AK", email: "aarav.kapoor@convene.edu", phone: "+91 98765 30001", assignedTasks: 5 },
      { name: "Prisha Iyer", role: "Catering Supervisor", avatar: "https://i.pravatar.cc/96?img=28", initials: "PI", email: "prisha.iyer@convene.edu", phone: "+91 98765 30002", assignedTasks: 4 },
      { name: "Kabir Mehta", role: "Accommodation Coordinator", avatar: "https://i.pravatar.cc/96?img=15", initials: "KM", email: "kabir.mehta@convene.edu", phone: "+91 98765 30003", assignedTasks: 3 },
      { name: "Anika Bose", role: "VIP Lounge Steward", avatar: "https://i.pravatar.cc/96?img=36", initials: "AB", email: "anika.bose@convene.edu", phone: "+91 98765 30004", assignedTasks: 4 }
    ],
    responsibilities: [
      "Oversee participant & mentor meal services",
      "Assign participant hostel rooms & manage key distribution",
      "Maintain VIP Lounge coffee, snacks & quiet zones",
      "Handle dietary restrictions & emergency medical hydration"
    ],
    todayTasks: [
      { id: "TASK-104", title: "Coordinate Mentor Lunch Catering", status: "In Progress", dueTime: "01:00 PM", priority: "Medium" },
      { id: "TASK-121", title: "Restock Main Arena Hydration Stations", status: "Todo", dueTime: "02:00 PM", priority: "High" }
    ],
    upcomingDuties: [
      "Coordinate Mentor Lunch catering delivery at 12:30 PM",
      "Check Hostel Block B room keys inventory",
      "Restock hydration points in Main Arena"
    ],
    resources: [
      { name: "Dietary Requirements List", type: "Sheet" },
      { name: "Hostel Block Room Allocation", type: "PDF" }
    ],
    inventory: [
      { name: "Catering Heating Trays", type: "Catering", status: "In Use" },
      { name: "Hostel Room Keycards", type: "Keys", status: "Assigned" }
    ],
    activity: [
      { id: "act-1", user: "Aarav Kapoor", action: "confirmed lunch box vendor delivery", timestamp: "10 mins ago" }
    ]
  },
  {
    id: "team-6",
    slug: "logistics",
    name: "Logistics Team",
    iconName: "Truck",
    lead: {
      name: "Kabir Mehta",
      role: "Logistics Lead",
      avatar: "https://i.pravatar.cc/96?img=15",
      initials: "KM",
      email: "kabir.mehta@convene.edu",
      phone: "+91 98765 50001"
    },
    status: "Busy",
    responsibilitySummary: "Transports venue hardware, sets up sponsor backdrops, manages loading docks and backup power.",
    activeTasksCount: 22,
    completedTasksCount: 18,
    totalTasksCount: 40,
    members: [
      { name: "Kabir Mehta", role: "Logistics Manager", avatar: "https://i.pravatar.cc/96?img=15", initials: "KM", email: "kabir.mehta@convene.edu", phone: "+91 98765 50001", assignedTasks: 6 },
      { name: "Rohan Nair", role: "Transport Supervisor", avatar: "https://i.pravatar.cc/96?img=12", initials: "RN", email: "rohan.nair@convene.edu", phone: "+91 98765 50002", assignedTasks: 5 },
      { name: "Aarav Kapoor", role: "Venue Layout Officer", avatar: "https://i.pravatar.cc/96?img=3", initials: "AK", email: "aarav.kapoor@convene.edu", phone: "+91 98765 50003", assignedTasks: 4 },
      { name: "Prisha Iyer", role: "Warehouse Keeper", avatar: "https://i.pravatar.cc/96?img=28", initials: "PI", email: "prisha.iyer@convene.edu", phone: "+91 98765 50004", assignedTasks: 4 }
    ],
    responsibilities: [
      "Transport furniture, signage, and hardware across venue zones",
      "Manage loading dock deliveries & warehouse inventory",
      "Maintain emergency power backup generators",
      "Set up main stage backdrops & sponsor booth partitions"
    ],
    todayTasks: [
      { id: "TASK-105", title: "Sponsor Banner & Booth Lighting Setup", status: "Blocked", dueTime: "10:30 AM", priority: "Medium" },
      { id: "TASK-124", title: "Unload Beanbags for Hacker Lounge", status: "In Progress", dueTime: "03:00 PM", priority: "Medium" }
    ],
    upcomingDuties: [
      "Repair Circuit Breaker 3 near Sponsor Booth 4",
      "Unload 50 extra beanbags for Hacker Lounge",
      "Setup Stage 2 podium & barrier ropes"
    ],
    resources: [
      { name: "Venue Master Floorplan", type: "CAD" },
      { name: "Loading Dock Pass Log", type: "Sheet" }
    ],
    inventory: [
      { name: "50KVA Silent Generators", type: "Power", status: "Active" },
      { name: "Heavy Duty Carts", type: "Transport", status: "In Use" }
    ],
    activity: [
      { id: "act-1", user: "Kabir Mehta", action: "reported Circuit Breaker 3 issue", timestamp: "12 mins ago" }
    ]
  },
  {
    id: "team-7",
    slug: "photography",
    name: "Photography Team",
    iconName: "Camera",
    lead: {
      name: "Tara Sethi",
      role: "Media & Photo Lead",
      avatar: "https://i.pravatar.cc/96?img=20",
      initials: "TS",
      email: "tara.sethi@convene.edu",
      phone: "+91 98765 60001"
    },
    status: "Active",
    responsibilitySummary: "Captures candidate team photos, mentor sessions, stage keynotes and high-res media drive uploads.",
    activeTasksCount: 5,
    completedTasksCount: 20,
    totalTasksCount: 25,
    members: [
      { name: "Tara Sethi", role: "Chief Photographer", avatar: "https://i.pravatar.cc/96?img=20", initials: "TS", email: "tara.sethi@convene.edu", phone: "+91 98765 60001", assignedTasks: 2 },
      { name: "Vihaan Gupta", role: "Cinematographer", avatar: "https://i.pravatar.cc/96?img=33", initials: "VG", email: "vihaan.gupta@convene.edu", phone: "+91 98765 60002", assignedTasks: 2 },
      { name: "Sara Sethi", role: "Photo Editor", avatar: "https://i.pravatar.cc/96?img=44", initials: "SS", email: "sara.sethi@convene.edu", phone: "+91 98765 60003", assignedTasks: 1 }
    ],
    responsibilities: [
      "Capture candidate team photos & mentor sessions",
      "Operate main stage camera rigs during keynote",
      "Process high-res press photos within 1 hour turnaround",
      "Maintain cloud photo drive for live press access"
    ],
    todayTasks: [
      { id: "TASK-106", title: "Photography & Media Live Stream Coverage", status: "Todo", dueTime: "02:00 PM", priority: "Low" },
      { id: "TASK-126", title: "Photograph Judging Round 1 in Labs A & B", status: "In Progress", dueTime: "11:30 AM", priority: "High" }
    ],
    upcomingDuties: [
      "Photograph Judging Round 1 in Labs A & B",
      "Upload Batch 2 high-res photos to Cloud Drive",
      "Prepare stage lighting for Awards Ceremony"
    ],
    resources: [
      { name: "Live Press Photo Cloud Drive", type: "Cloud Drive" }
    ],
    inventory: [
      { name: "Full Frame DSLR Cameras", type: "Camera", status: "Active" },
      { name: "Wireless Flash Transmitters", type: "Lighting", status: "In Use" }
    ],
    activity: [
      { id: "act-1", user: "Tara Sethi", action: "uploaded 45 Keynote high-res photos", timestamp: "18 mins ago" }
    ]
  },
  {
    id: "team-8",
    slug: "finance",
    name: "Finance Team",
    iconName: "DollarSign",
    lead: {
      name: "Rohan Nair",
      role: "Finance Director",
      avatar: "https://i.pravatar.cc/96?img=12",
      initials: "RN",
      email: "rohan.nair@convene.edu",
      phone: "+91 98765 70001"
    },
    status: "Active",
    responsibilitySummary: "Processes mentor stipends, approves vendor invoices, manages prize money pools and financial audits.",
    activeTasksCount: 4,
    completedTasksCount: 36,
    totalTasksCount: 40,
    members: [
      { name: "Rohan Nair", role: "Finance Lead", avatar: "https://i.pravatar.cc/96?img=12", initials: "RN", email: "rohan.nair@convene.edu", phone: "+91 98765 70001", assignedTasks: 2 },
      { name: "Meera Menon", role: "Reimbursements Manager", avatar: "https://i.pravatar.cc/96?img=9", initials: "MM", email: "meera.menon@convene.edu", phone: "+91 98765 70002", assignedTasks: 2 }
    ],
    responsibilities: [
      "Process mentor travel reimbursements & stipends",
      "Approve vendor invoices & petty cash requests",
      "Audit cash prize pools for hackathon track winners",
      "Generate final event financial audit ledger"
    ],
    todayTasks: [
      { id: "TASK-128", title: "Audit Hackathon Track Prize Pool Funds", status: "Completed", dueTime: "10:00 AM", priority: "High" }
    ],
    upcomingDuties: [
      "Verify 12 mentor travel receipts",
      "Disburse catering vendor advance invoice",
      "Prepare prize money cheques for Stage presentation"
    ],
    resources: [
      { name: "Event Budget Ledger", type: "Sheet" }
    ],
    inventory: [
      { name: "Petty Cash Safe", type: "Safe", status: "Secured" }
    ],
    activity: [
      { id: "act-1", user: "Rohan Nair", action: "approved Catering Vendor Invoice #0804", timestamp: "50 mins ago" }
    ]
  },
  {
    id: "team-9",
    slug: "sponsorship",
    name: "Sponsorship Team",
    iconName: "Briefcase",
    lead: {
      name: "Prisha Iyer",
      role: "Sponsorship Lead",
      avatar: "https://i.pravatar.cc/96?img=28",
      initials: "PI",
      email: "prisha.iyer@convene.edu",
      phone: "+91 98765 80001"
    },
    status: "Waiting",
    responsibilitySummary: "Manages corporate sponsor booth allocations, VIP escorting, swag bags distribution and partner reports.",
    activeTasksCount: 7,
    completedTasksCount: 24,
    totalTasksCount: 31,
    members: [
      { name: "Prisha Iyer", role: "Sponsorship Manager", avatar: "https://i.pravatar.cc/96?img=28", initials: "PI", email: "prisha.iyer@convene.edu", phone: "+91 98765 80001", assignedTasks: 3 },
      { name: "Kabir Mehta", role: "Sponsor Desk Escort", avatar: "https://i.pravatar.cc/96?img=15", initials: "KM", email: "kabir.mehta@convene.edu", phone: "+91 98765 80002", assignedTasks: 2 },
      { name: "Diya Shah", role: "Swag Distribution Lead", avatar: "https://i.pravatar.cc/96?img=5", initials: "DS", email: "diya.shah@convene.edu", phone: "+91 98765 80003", assignedTasks: 2 }
    ],
    responsibilities: [
      "Manage sponsor booth allocations & branding visibility",
      "Escort VIP corporate sponsors & mentors",
      "Distribute sponsor branded swag boxes to participants",
      "Collect sponsor evaluation reports for post-event deck"
    ],
    todayTasks: [
      { id: "TASK-130", title: "Greet Corporate Sponsor VIP Guests", status: "In Progress", dueTime: "10:00 AM", priority: "High" }
    ],
    upcomingDuties: [
      "Greet Google & Microsoft VIP representatives at Entrance",
      "Ensure Title Sponsor banner lighting is active",
      "Distribute 500 sponsor goodie bags"
    ],
    resources: [
      { name: "Sponsor Deliverables Tracker", type: "Notion" }
    ],
    inventory: [
      { name: "Sponsor Goodie Boxes", type: "Swag", status: "In Stock" }
    ],
    activity: [
      { id: "act-1", user: "Prisha Iyer", action: "escorted Title Sponsor to VIP Lounge", timestamp: "35 mins ago" }
    ]
  },
  {
    id: "team-10",
    slug: "volunteer-management",
    name: "Volunteer Management Team",
    iconName: "HeartHandshake",
    lead: {
      name: "Vihaan Gupta",
      role: "Volunteer Lead",
      avatar: "https://i.pravatar.cc/96?img=33",
      initials: "VG",
      email: "vihaan.gupta@convene.edu",
      phone: "+91 98765 00001"
    },
    status: "Active",
    responsibilitySummary: "Dispatches 45 student volunteers across venue checkpoints, handles shift rotations and crew meals.",
    activeTasksCount: 15,
    completedTasksCount: 40,
    totalTasksCount: 55,
    members: [
      { name: "Vihaan Gupta", role: "Volunteer Coordinator", avatar: "https://i.pravatar.cc/96?img=33", initials: "VG", email: "vihaan.gupta@convene.edu", phone: "+91 98765 00001", assignedTasks: 4 },
      { name: "Reyansh Ahuja", role: "Shift Supervisor", avatar: "https://i.pravatar.cc/96?img=52", initials: "RA", email: "reyansh.ahuja@convene.edu", phone: "+91 98765 00002", assignedTasks: 3 },
      { name: "Anika Bose", role: "Roving Crew Captain", avatar: "https://i.pravatar.cc/96?img=36", initials: "AB", email: "anika.bose@convene.edu", phone: "+91 98765 00003", assignedTasks: 4 },
      { name: "Aarav Kapoor", role: "Briefing Officer", avatar: "https://i.pravatar.cc/96?img=3", initials: "AK", email: "aarav.kapoor@convene.edu", phone: "+91 98765 00004", assignedTasks: 4 }
    ],
    responsibilities: [
      "Dispatch 45 student volunteers across venue checkpoints",
      "Conduct shift rotation briefings every 4 hours",
      "Provide volunteer food, water & rest area management",
      "Monitor volunteer attendance & operational duty logs"
    ],
    todayTasks: [
      { id: "TASK-132", title: "Dispatch 10 Volunteers to Hall B Lunch Desk", status: "In Progress", dueTime: "12:30 PM", priority: "High" }
    ],
    upcomingDuties: [
      "Brief Afternoon Shift Volunteer Crew at 01:30 PM",
      "Dispatch 10 volunteers to Hall B Lunch Service",
      "Collect shift feedback & issue meal passes"
    ],
    resources: [
      { name: "Volunteer Roster & Shift Chart", type: "Sheet" }
    ],
    inventory: [
      { name: "Volunteer T-Shirts", type: "Apparel", status: "Distributed" },
      { name: "Walkie Talkie Radios", type: "Radio", status: "Active" }
    ],
    activity: [
      { id: "act-1", user: "Vihaan Gupta", action: "dispatched 10 volunteers to Hall B Lunch Service", timestamp: "14 mins ago" }
    ]
  }
];
