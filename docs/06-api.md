# API Contract

Base URL: `/api`

All protected endpoints use `Authorization: Bearer <jwt>`.

## Authentication

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`

## Events

- `GET /events`: events where the user has membership.
- `POST /events`: create an event and organizer membership.
- `GET /events/:eventId`: event data after membership authorization.

## Stages

- `GET /events/:eventId/stages`: event stages with venue/images.
- `POST /events/:eventId/stages`: lead organizer creates a stage.
- `PATCH /stages/:stageId`: lead organizer updates a stage.

Preferred schedule input is `startAt`/`endAt`. Temporary compatibility input `timeWindow` is parsed against the event date. Preferred location input is `venueId`; a submitted legacy `location` creates or reuses an event venue.

## Tasks

- `GET /events/:eventId/tasks`
- `POST /events/:eventId/tasks`: lead organizer creates a task.
- `PATCH /tasks/:taskId/status`: organizer of the task's event updates status.

Task assignment uses `assignedOrgMemberId`; filtering uses `orgTeamId`.

## Participants and QR

- `POST /participants/:eventId/register`
- `GET /participants/:eventId/participants`: event members only.
- `PATCH /participants/:id/status`: organizer of the participant's event only.
- `POST /qr/verify`: organizer of the QR participant's event only.

## Error conventions

- `400`: invalid or missing input
- `401`: missing/invalid JWT
- `403`: authenticated but not authorized for the event/action
- `404`: record not found
- `409`: duplicate event-scoped record
- `500`: unexpected server failure
