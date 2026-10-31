# Convene test data

## Participant import

`participant-import-sample.xlsx` is a single-sheet workbook using the same participant fields exposed by the app and API. Each row is one participant. Repeat `Team Code` for members of the same team; the backend groups those rows into one event team.

Required participant identity: `Participant Name` plus either `Email` or a 10-digit `Phone`.

Accepted participant statuses: `Unconfirmed`, `Confirmed`, `Checked In`, `Absent`, `Withdrawn`, and `Rejected`.

Upload it from Participants → Import workbook. The export from that page uses the same column order, so it can be edited and re-imported.

## Demo event data

To create a second event without deleting existing data, run this from the repository root:

```bash
npm run seed:demo --workspace convene-backend
```

The command prints the new event ID and the organizer email. It creates demo stages, duties, tasks, inventory, issues, participant teams, and memberships. Resources are intentionally omitted because resource files must be uploaded to the configured storage bucket.
