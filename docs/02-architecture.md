# Architecture

## Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: PostgreSQL through Prisma
- Authentication: JWT and bcrypt
- File storage: private Supabase Storage; database stores object paths and resource metadata while the API returns short-lived signed URLs
- Spreadsheet processing: SheetJS (`xlsx`) in the backend

## Boundaries

The backend is the security boundary. Frontend role checks are for UX only. Every event-scoped query must include `eventId` and be authorized against `EventMembership`.

## Backend flow

`route -> authenticate -> event membership -> organizer/lead access when required -> validate input -> Prisma query`

Use transactions when a request changes multiple related records.

## Frontend flow

The active event is selected from the authenticated user's memberships. Pages request data for that event only. The app uses a Zustand store for session, active-event, and theme UI state; route-level page loading uses React lazy loading and Suspense.

## Important distinction

`OrgTeam` is a pre-event organizational group. `Duty` is an event-day operational shift and is not owned by an org team. A duty can have many users through `DutyAssignment`.
