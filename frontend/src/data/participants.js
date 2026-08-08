const colleges = [
  "BITS Pilani",
  "IIT Delhi",
  "NIT Trichy",
  "VIT Vellore",
  "SRM Institute",
  "Manipal University",
  "Delhi Technological University",
  "PES University"
];

const projects = [
  "Campus Safety Command Center",
  "AI-Powered Mentor Matching",
  "Smart Waste Routing",
  "Emergency Room Allocator",
  "Carbon Ledger for Events",
  "Real-Time Crowd Flow Map",
  "Volunteer Dispatch Console",
  "QR Meal Token Wallet"
];

const departments = ["Registration", "Hospitality", "Operations", "Tech", "Stage", "Logistics"];
const statuses = ["Unconfirmed", "Confirmed", "Checked In", "Rejected", "Completed"];
const firstNames = ["Aarav", "Diya", "Kabir", "Meera", "Rohan", "Tara", "Ishaan", "Anika", "Vihaan", "Prisha", "Reyansh", "Sara"];
const lastNames = ["Kapoor", "Shah", "Nair", "Menon", "Rao", "Iyer", "Mehta", "Bose", "Singh", "Gupta", "Ahuja", "Sethi"];
const roles = ["Leader", "Frontend", "Backend", "Design", "Hardware"];

function memberFor(teamIndex, memberIndex) {
  const first = firstNames[(teamIndex + memberIndex * 2) % firstNames.length];
  const last = lastNames[(teamIndex * 2 + memberIndex) % lastNames.length];
  const name = `${first} ${last}`;
  return {
    name,
    initials: `${first[0]}${last[0]}`,
    avatar: `https://i.pravatar.cc/96?img=${((teamIndex * 5 + memberIndex) % 60) + 1}`,
    email: `${first}.${last}.${teamIndex + 1}@example.edu`.toLowerCase(),
    phone: `+91 98${String(70000000 + teamIndex * 1009 + memberIndex * 137).slice(0, 8)}`,
    role: roles[memberIndex] ?? "Member"
  };
}

const teamNamesList = [
  "Quantum Coders",
  "Binary Beasts",
  "Neural Nets",
  "Code Alchemists",
  "Byte Busters",
  "Data Dynamos",
  "Logic Lords",
  "Syntax Squad",
  "Pixel Pioneers",
  "Stack Overlords",
  "Tensor Titans",
  "Cyber Knights",
  "Algorithm Aces",
  "Cloud Cruisers",
  "Dev Dynamics",
  "Matrix Masters",
  "Prompt Engineers",
  "Bit Wizards",
  "Git Heroes",
  "Kernel Kings",
  "Web Mavericks",
  "Sync Synthetics",
  "Vector Vanguards",
  "Zero One Zen"
];

export const participantTeams = Array.from({ length: 24 }, (_, index) => {
  const memberCount = index % 3 === 0 ? 5 : 4;
  const members = Array.from({ length: memberCount }, (__, memberIndex) => memberFor(index, memberIndex));
  const status = statuses[index % statuses.length];
  const accommodation = index % 4 === 0 ? "Not Required" : index % 5 === 0 ? "Pending" : "Assigned";
  const food = index % 6 === 0 ? "Dietary Flag" : index % 4 === 0 ? "Pending" : "Issued";
  const qr = status === "Checked In" || status === "Completed" ? "Scanned" : index % 5 === 0 ? "Missing" : "Generated";

  return {
    id: `team-${index + 1}`,
    team: `Team ${index + 1}`,
    teamName: teamNamesList[index % teamNamesList.length],
    leader: members[0],
    college: colleges[index % colleges.length],
    members,
    project: projects[index % projects.length],
    status,
    department: departments[index % departments.length],
    accommodation,
    food,
    qr,
    certificates: status === "Completed" ? "Issued" : "Pending",
    feedback: index % 3 === 0 ? "Received" : "Pending",
    notes: index % 4 === 0 ? "Needs accommodation confirmation before dinner service." : "No internal notes yet."
  };
});
