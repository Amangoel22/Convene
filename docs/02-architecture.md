# Architecture

## Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: PostgreSQL through Prisma
- Authentication: JWT and bcrypt
- File storage: external object storage; database stores URLs only

## Boundaries

The backend is the security boundary. Frontend role checks are for UX only. Every event-scoped query must include `eventId` and be authorized against `EventMembership`.

## Backend flow

`route -> authenticate -> event membership -> organizer/lead access when required -> validate input -> Prisma query`

Use transactions when a request changes multiple related records.

## Frontend flow

The active event is selected from the authenticated user's memberships. Pages request data for that event only. Server state should eventually move to TanStack Query; the current app uses a Zustand store for session and active-event UI state.

## Important distinction

`OrgTeam` is a pre-event organizational group. `Duty` is an event-day operational shift and is not owned by an org team. A duty can have many users through `DutyAssignment`.