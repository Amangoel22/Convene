export const initialStages = [
  {
    id: "stage-1",
    slug: "registration",
    title: "Registration & Check-In",
    timeRange: "08:00 – 09:30",
    timeDisplay: "08:00 AM",
    venue: "Main Lobby",
    ownerTeam: "Registration Team",
    ownerSlug: "registration",
    status: "Completed",
    description: "On-site check-in lanes active, badge lanyard issuance, volunteer dispatch, and participant helpdesk orientation.",
    resources: [
      { name: "Registration Desk Manual.pdf", type: "PDF" },
      { name: "Venue Entrance Map.png", type: "Image" }
    ],
    relatedTasksCount: 4
  },
  {
    id: "stage-2",
    slug: "opening-ceremony",
    title: "Opening Ceremony & Keynote",
    timeRange: "09:30 – 10:15",
    timeDisplay: "09:30 AM",
    venue: "Main Auditorium",
    ownerTeam: "Operations Team",
    ownerSlug: "logistics",
    status: "Completed",
    description: "Welcome address by organizing committee, sponsor keynote presentations, rulebook release, and stage lighting sequence.",
    resources: [
      { name: "Opening Keynote Slides.pdf", type: "Presentation" },
      { name: "Stage Mic & Audio Map.pdf", type: "PDF" }
    ],
    relatedTasksCount: 3
  },
  {
    id: "stage-3",
    slug: "hackathon-begins",
    title: "Hackathon Begins & Hacking Phase",
    timeRange: "10:15 – 15:00",
    timeDisplay: "10:15 AM",
    venue: "Labs A–D",
    ownerTeam: "Technical Team",
    ownerSlug: "technical",
    status: "Completed",
    description: "Hacking countdown launch, WiFi network bandwidth allocation, initial mentor distribution across track tables.",
    resources: [
      { name: "Track Problem Statements.pdf", type: "PDF" },
      { name: "WiFi Access & Server Config.json", type: "Config" }
    ],
    relatedTasksCount: 6
  },
  {
    id: "stage-4",
    slug: "mentoring",
    title: "Mentoring Round & Technical Reviews",
    timeRange: "15:00 – 17:30",
    timeDisplay: "03:00 PM",
    venue: "Labs A–D",
    ownerTeam: "Technical Team",
    ownerSlug: "technical",
    status: "LIVE",
    remainingTime: "01:18:42",
    nextStage: "Judging & Pitch Evaluations",
    nextStartsIn: "30 minutes",
    description: "Roving mentors evaluate team architecture, provide API guidance, conduct progress check-ins, and prepare evaluation rubrics.",
    resources: [
      { name: "Mentor Feedback Guidelines.pdf", type: "PDF" },
      { name: "Lab Table Allocation Map.png", type: "Image" },
      { name: "Emergency Contacts.pdf", type: "PDF" }
    ],
    relatedTasksCount: 5
  },
  {
    id: "stage-5",
    slug: "judging",
    title: "Judging & Pitch Evaluations",
    timeRange: "17:30 – 19:30",
    timeDisplay: "05:30 PM",
    venue: "Seminar Hall & Stage 2",
    ownerTeam: "Judging Team",
    ownerSlug: "design",
    status: "Upcoming",
    description: "Top finalist teams present 5-minute live demos before panel of corporate judges and track sponsors.",
    resources: [
      { name: "Judge Handbook & Rubric.pdf", type: "PDF" },
      { name: "Judging Room Floorplan.pdf", type: "PDF" }
    ],
    relatedTasksCount: 4
  },
  {
    id: "stage-6",
    slug: "closing-ceremony",
    title: "Closing Ceremony & Prize Distribution",
    timeRange: "20:00 – 21:30",
    timeDisplay: "08:00 PM",
    venue: "Main Auditorium",
    ownerTeam: "Operations Team",
    ownerSlug: "logistics",
    status: "Upcoming",
    description: "Winner announcements across tracks, trophy & cash prize disbursal, sponsor closing vote of thanks, and photo session.",
    resources: [
      { name: "Winner Prize Cheque Ledger.pdf", type: "PDF" },
      { name: "Closing Presentation Slides.pptx", type: "Presentation" }
    ],
    relatedTasksCount: 3
  }
];
