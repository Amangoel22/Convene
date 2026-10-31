# Workflows

## Organizer setup

1. User signs in.
2. User creates or selects an event.
3. Lead creates venues and uploads venue images.
4. Lead creates organizing teams and members.
5. Lead creates stages and pre-event tasks.
6. Lead creates event-day duties and assigns one or more users.

## Event day

1. Organizer opens the event dashboard.
2. Staff views current and upcoming stages.
3. Staff performs assigned duties.
4. Organizer scans a participant QR.
5. Backend finds the participant, checks organizer membership for that same event, and returns limited verification data.
6. Organizer updates check-in status and records issues.

## Resource workflow

1. A lead organizer selects one PDF, JPG, PNG, CSV, XLS, or XLSX file up to 5 MB.
2. The backend validates the MIME type and size.
3. The file is uploaded to the private event-scoped Supabase Storage path.
4. Event resource metadata is written to PostgreSQL.
5. Authorized members receive a short-lived signed download URL.

## Participant journey

1. Participant joins an event.
2. Participant views event overview, stages, venue details, and venue images.
3. Participant presents their QR at entry.
4. Organizer verifies the QR; participant status changes to checked in.

## Task model

Tasks are preparation work. They can be assigned across teams because the assignee is an event member, not restricted by the optional team context.

## Duty model

Duties are event-day shifts. The assignee's organizing team is irrelevant to assignment.
