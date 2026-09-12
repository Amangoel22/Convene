# Database Model

## Identity and access

- `User`: global login identity.
- `Event`: tenant/scope boundary.
- `EventMembership`: user access to an event (`organizer` or `participant`).
- `OrgAccess`: organizer access level (`lead` or `member`).

## Organizers

- `OrgTeam`: event-scoped group such as Design or Logistics.
- `OrgMember`: event person record, optionally linked to a login user.
- `Task`: pre-event work. `orgTeamId` is optional context; `assignedOrgMemberId` can point to a member of any team in the same event.

## Participants

- `ParticipantTeam`: event participant group.
- `ParticipantTeamMember`: users in participant teams.
- `EventParticipant`: event registration, status, private notes, and cryptographically random QR token.

## Event execution

- `Venue`: reusable event location with address, map coordinates, and map URL.
- `VenueImage`: ordered venue image URLs.
- `Stage`: run-of-show item with `startAt`, `endAt`, optional venue, and optional owning org team.
- `Duty`: event-day shift with `DutyCategory`, timestamps, optional venue, and notes.
- `DutyAssignment`: many-to-many assignment of users to duties.
- `EventResource`: event file metadata and external URL.
- `Issue`: operational incident with optional org team, reporter, assignee, status, and resolution feedback.

## Design decisions

- Foreign keys and compound unique constraints prevent duplicate event membership, teams, venues, and assignments.
- Cascades remove event-owned data when an event is deleted.
- Schedule data uses UTC-capable timestamps, not display strings. The UI formats them for users.
- Venue images are separate from resources because they describe a location rather than a shared document.