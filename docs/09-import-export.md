# Import and Export

## Participants

The Participants page supports Excel import and export. The backend uses SheetJS (`xlsx`) and accepts one workbook sheet containing participant rows. Team grouping is derived from the shared team code.

The import workbook should contain the fields represented by the participant table, including participant identity, contact information, organization/college, team name, team code, and participant status. Team codes should be unique per event and consistent for every member of one team.

Import is organizer-scoped and event-scoped. The server validates the workbook, creates or reuses participant teams, and writes event participants in the selected event.

## Tasks

Tasks can be exported as an event-scoped workbook. Export includes the task fields used by the application, including title, description, assignee, team, status, priority, due date, and completion state.

## Sample files

Generated sample artifacts are stored under:

```text
outputs/2026-10-31-convene/
```

## Safety rules

- Imports always target the active event selected by the authenticated user.
- Do not import secrets, passwords, JWTs, or service credentials.
- Validate team codes before importing large participant workbooks.
- Exported workbooks may contain personal data and should be handled as private event data.
