export const initialTasks = [
  {
    id: "TASK-101",
    title: "Setup Registration Desk & QR Scanners",
    description: "Assemble 4 registration lanes, configure wireless QR scanners, test badge printers and distribute scanner tablets.",
    department: "Registration",
    priority: "Critical",
    status: "In Progress",
    assignee: {
      name: "Diya Shah",
      initials: "DS",
      avatar: "https://i.pravatar.cc/96?img=5",
      email: "diya.shah@convene.edu"
    },
    dueDate: "Today, 08:30 AM",
    completedToday: false,
    checklist: [
      { id: "c1", title: "Unpack 4 tablet scanners & test battery level", completed: true },
      { id: "c2", title: "Connect Bluetooth thermal badge printers", completed: true },
      { id: "c3", title: "Test live check-in sync with backend API", completed: false },
      { id: "c4", title: "Verify spare printer paper rolls (10 units)", completed: false }
    ],
    attachments: [
      { name: "registration_desk_layout.pdf", size: "1.4 MB" },
      { name: "scanner_pairing_guide.png", size: "840 KB" }
    ],
    notes: "Lanes 1 & 2 reserved for pre-registered VIP participants. Keep hotline phone active.",
    activity: [
      { id: "a1", user: "Diya Shah", action: "changed status to In Progress", timestamp: "10 mins ago" },
      { id: "a2", user: "Aman Goel", action: "assigned task to Diya Shah", timestamp: "1 hour ago" },
      { id: "a3", user: "Diya Shah", action: "completed subtask 'Unpack 4 tablet scanners'", timestamp: "25 mins ago" }
    ]
  },
  {
    id: "TASK-102",
    title: "Arrange Judges Room & Evaluation Scoring Pads",
    description: "Set up 6 private judging stations with laptops, printed rubrics, silent water service, and power outlets.",
    department: "Stage",
    priority: "High",
    status: "Todo",
    assignee: {
      name: "Rohan Nair",
      initials: "RN",
      avatar: "https://i.pravatar.cc/96?img=12",
      email: "rohan.nair@convene.edu"
    },
    dueDate: "Today, 11:00 AM",
    completedToday: false,
    checklist: [
      { id: "c1", title: "Verify 6 laptops with judging portal logged in", completed: false },
      { id: "c2", title: "Print 30 physical rubric backup sheets", completed: false },
      { id: "c3", title: "Stock bottled water & coffee dispenser", completed: false }
    ],
    attachments: [{ name: "judging_criteria_v2.pdf", size: "620 KB" }],
    notes: "Judges arrive at 11:15 AM for briefing. Ensure door keycard access is configured.",
    activity: [{ id: "a1", user: "Rohan Nair", action: "created task", timestamp: "2 hours ago" }]
  },
  {
    id: "TASK-103",
    title: "Print & Stamp Finalist Certificates",
    description: "Print gold-foil certificates for top 3 teams across tracks and get organizer signatures.",
    department: "Operations",
    priority: "High",
    status: "Completed",
    assignee: {
      name: "Meera Menon",
      initials: "MM",
      avatar: "https://i.pravatar.cc/96?img=9",
      email: "meera.menon@convene.edu"
    },
    dueDate: "Today, 09:15 AM",
    completedToday: true,
    checklist: [
      { id: "c1", title: "Verify team name spelling against portal", completed: true },
      { id: "c2", title: "Print heavy stock certificates (24 sheets)", completed: true },
      { id: "c3", title: "Collect Lead Organizer signatures", completed: true }
    ],
    attachments: [{ name: "certificate_template_final.ai", size: "4.2 MB" }],
    notes: "Certificates placed in velvet folders inside Stage Left drawer.",
    activity: [
      { id: "a1", user: "Meera Menon", action: "marked task as Completed", timestamp: "35 mins ago" },
      { id: "a2", user: "Meera Menon", action: "uploaded certificate_template_final.ai", timestamp: "2 hours ago" }
    ]
  },
  {
    id: "TASK-104",
    title: "Coordinate Mentor Lunch Catering & Dietary Baskets",
    description: "Oversee delivery of 120 lunch boxes, set up dietary flag tables (vegan, gluten-free, Jain) and beverage bar.",
    department: "Hospitality",
    priority: "Medium",
    status: "In Progress",
    assignee: {
      name: "Aarav Kapoor",
      initials: "AK",
      avatar: "https://i.pravatar.cc/96?img=3",
      email: "aarav.kapoor@convene.edu"
    },
    dueDate: "Today, 01:00 PM",
    completedToday: false,
    checklist: [
      { id: "c1", title: "Confirm vendor arrival time (12:30 PM)", completed: true },
      { id: "c2", title: "Set up warming trays in Hall B", completed: false },
      { id: "c3", title: "Label 15 special dietary lunch boxes", completed: false }
    ],
    attachments: [{ name: "catering_invoice_0804.pdf", size: "310 KB" }],
    notes: "Vendor contact: Chef Sharma (+91 98765 43210). Door 3 loading bay delivery.",
    activity: [
      { id: "a1", user: "Aarav Kapoor", action: "updated due time to 1:00 PM", timestamp: "45 mins ago" }
    ]
  },
  {
    id: "TASK-105",
    title: "Sponsor Banner & Booth Lighting Setup",
    description: "Erect 8 backdrop banners for main sponsors, install LED accent lights and verify power sockets.",
    department: "Logistics",
    priority: "Medium",
    status: "Blocked",
    assignee: {
      name: "Kabir Mehta",
      initials: "KM",
      avatar: "https://i.pravatar.cc/96?img=15",
      email: "kabir.mehta@convene.edu"
    },
    dueDate: "Today, 10:30 AM",
    completedToday: false,
    checklist: [
      { id: "c1", title: "Mount Title Sponsor backdrop (Main Stage)", completed: true },
      { id: "c2", title: "Install 6 roll-up banners in Innovation Hub", completed: false },
      { id: "c3", title: "Fix loose extension cord on Booth 4", completed: false }
    ],
    attachments: [{ name: "sponsor_floorplan.png", size: "1.8 MB" }],
    notes: "BLOCKED: Waiting for electrician to repair power outlet circuit breaker 3 near Booth 4.",
    activity: [
      { id: "a1", user: "Kabir Mehta", action: "changed status to Blocked", timestamp: "15 mins ago" },
      { id: "a2", user: "Kabir Mehta", action: "added note about circuit breaker", timestamp: "15 mins ago" }
    ]
  },
  {
    id: "TASK-106",
    title: "Photography & Media Live Stream Coverage",
    description: "Brief 3 roving photographers, test main stage live stream camera feed and audio capture.",
    department: "Tech",
    priority: "Low",
    status: "Todo",
    assignee: {
      name: "Tara Sethi",
      initials: "TS",
      avatar: "https://i.pravatar.cc/96?img=20",
      email: "tara.sethi@convene.edu"
    },
    dueDate: "Today, 02:00 PM",
    completedToday: false,
    checklist: [
      { id: "c1", title: "Format 6 SD cards and check battery packs", completed: false },
      { id: "c2", title: "Test YouTube 4K stream key & latency", completed: false }
    ],
    attachments: [],
    notes: "Roving photographers need media press passes from Registration desk.",
    activity: [{ id: "a1", user: "Tara Sethi", action: "created task", timestamp: "3 hours ago" }]
  },
  {
    id: "TASK-107",
    title: "Main Stage Projector & Wireless Mic Test",
    description: "Run 4K presentation test loop, calibrate color profiles, and test handheld wireless mic frequencies.",
    department: "Tech",
    priority: "Critical",
    status: "Completed",
    assignee: {
      name: "Ishaan Bose",
      initials: "IB",
      avatar: "https://i.pravatar.cc/96?img=25",
      email: "ishaan.bose@convene.edu"
    },
    dueDate: "Today, 08:00 AM",
    completedToday: true,
    checklist: [
      { id: "c1", title: "Test HDMI 2.1 matrix switcher", completed: true },
      { id: "c2", title: "Replace AA batteries in 4 stage mics", completed: true },
      { id: "c3", title: "Verify stage monitor audio return", completed: true }
    ],
    attachments: [{ name: "stage_audio_routing.json", size: "14 KB" }],
    notes: "All 4 mics calibrated clean. Gain levels set on digital mixing console Channel 1-4.",
    activity: [{ id: "a1", user: "Ishaan Bose", action: "marked task as Completed", timestamp: "1 hour ago" }]
  },
  {
    id: "TASK-108",
    title: "Emergency Medical & First Aid Desk Readiness",
    description: "Inspect first-aid kits, verify oxygen cylinder pressure, and establish direct contact line with campus hospital.",
    department: "Operations",
    priority: "High",
    status: "Todo",
    assignee: {
      name: "Prisha Iyer",
      initials: "PI",
      avatar: "https://i.pravatar.cc/96?img=28",
      email: "prisha.iyer@convene.edu"
    },
    dueDate: "Today, 09:00 AM",
    completedToday: false,
    checklist: [
      { id: "c1", title: "Confirm paramedic attendance (2 station officers)", completed: true },
      { id: "c2", title: "Stock emergency hydration salts & ice packs", completed: false }
    ],
    attachments: [],
    notes: "First Aid desk situated next to Hall A South Exit.",
    activity: [{ id: "a1", user: "Prisha Iyer", action: "created task", timestamp: "4 hours ago" }]
  }
];
