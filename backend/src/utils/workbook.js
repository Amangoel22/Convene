// Purpose: workbook provides the shared Excel and CSV parsing/export helpers.
import XLSX from "xlsx";

export const PARTICIPANT_WORKBOOK_HEADERS = [
  "Team ID",
  "Team Code",
  "Team Name",
  "Team Status",
  "Team College / Org",
  "Team Notes",
  "Team Lead Name",
  "Team Lead Email",
  "Team Lead Phone",
  "Participant ID",
  "Participant Code",
  "Participant Name",
  "Email",
  "Phone",
  "College / Org",
  "Participant Status",
  "Role",
  "Notes",
];

// Purpose: convert a spreadsheet header into a stable comparison key.
function normalizeHeader(header) {
  return String(header || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

// Purpose: normalize participant status values from external registration platforms.
export function normalizeParticipantStatus(value) {
  const normalized = String(value || "Unconfirmed")
    .trim()
    .toLowerCase();
  const statusMap = {
    "checked in": "Checked In",
    checked_in: "Checked In",
    confirmed: "Confirmed",
    unconfirmed: "Unconfirmed",
    absent: "Absent",
    withdrawn: "Withdrawn",
    rejected: "Rejected",
  };
  return statusMap[normalized] || null;
}

// Purpose: normalize imported participant rows and report spreadsheet validation errors.
export function parseParticipantWorkbook(buffer) {
  const workbook = XLSX.read(buffer, { type: "buffer", raw: false });
  const firstSheet = workbook.SheetNames[0];
  if (!firstSheet)
    return { rows: [], errors: ["The workbook does not contain a worksheet."] };

  const sheet = workbook.Sheets[firstSheet];
  const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: "", raw: false });
  const errors = [];
  const rows = rawRows.map((rawRow, index) => {
    const row = Object.fromEntries(
      Object.entries(rawRow).map(([key, value]) => [
        normalizeHeader(key),
        String(value ?? "").trim(),
      ]),
    );
    const rowNumber = index + 2;
    const teamCode = row["team code"];
    const teamName = row["team name"];
    const participantName = row["participant name"];
    const email = row.email?.toLowerCase() || "";
    const phone = row.phone?.replace(/\D/g, "").slice(-10) || "";
    const participantStatus = normalizeParticipantStatus(
      row["participant status"],
    );
    const roleValue = String(row.role || "").toLowerCase();

    if (!teamCode) errors.push(`Row ${rowNumber}: Team Code is required.`);
    if (!teamName) errors.push(`Row ${rowNumber}: Team Name is required.`);
    if (!participantName)
      errors.push(`Row ${rowNumber}: Participant Name is required.`);
    if (!email && !phone)
      errors.push(`Row ${rowNumber}: Email or Phone is required.`);
    if (email && !/^\S+@\S+\.\S+$/.test(email))
      errors.push(`Row ${rowNumber}: Email is invalid.`);
    if (phone && phone.length !== 10)
      errors.push(`Row ${rowNumber}: Phone must contain 10 digits.`);
    if (!participantStatus)
      errors.push(`Row ${rowNumber}: Participant Status is invalid.`);

    return {
      rowNumber,
      teamId: row["team id"] || "",
      teamCode,
      teamName,
      teamStatus: row["team status"] || "Unconfirmed",
      teamCollege: row["team college org"] || row["college org"] || "",
      teamNotes: row["team notes"] || "",
      teamLeadName: row["team lead name"] || "",
      teamLeadEmail: row["team lead email"]?.toLowerCase() || "",
      teamLeadPhone:
        row["team lead phone"]?.replace(/\D/g, "").slice(-10) || "",
      participantId: row["participant id"] || "",
      participantCode: row["participant code"] || "",
      participantName,
      email,
      phone,
      college: row["college org"] || row["team college org"] || "",
      participantStatus: participantStatus || "Unconfirmed",
      role: ["lead", "team lead", "leader"].includes(roleValue)
        ? "lead"
        : "member",
      notes: row.notes || "",
    };
  });

  const teamNames = new Map();
  const participantKeys = new Set();
  rows.forEach((row) => {
    if (!row.teamCode) return;
    const previousName = teamNames.get(row.teamCode);
    if (
      previousName &&
      previousName.toLowerCase() !== row.teamName.toLowerCase()
    ) {
      errors.push(
        `Row ${row.rowNumber}: Team Code ${row.teamCode} has conflicting team names.`,
      );
    } else {
      teamNames.set(row.teamCode, row.teamName);
    }
    const participantKey = `${row.teamCode}|${row.email || row.phone}`;
    if (participantKeys.has(participantKey))
      errors.push(
        `Row ${row.rowNumber}: Duplicate participant in Team Code ${row.teamCode}.`,
      );
    participantKeys.add(participantKey);
  });

  return { rows, errors };
}

// Purpose: create a single-sheet workbook with the exact supplied column order.
export function createWorkbookBuffer(sheetName, headers, rows) {
  const worksheet = XLSX.utils.json_to_sheet(rows, { header: headers });
  worksheet["!cols"] = headers.map((header) => ({
    wch: Math.max(14, Math.min(28, header.length + 4)),
  }));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
}
