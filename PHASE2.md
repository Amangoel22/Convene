# Phase 2 — Engineering Depth

This is a private learning and implementation plan for the next phase of Convene. It is intentionally ignored by Git so it can change as the learning plan evolves.

## Goal

Use Convene to become a stronger full-stack engineer while exploring DevOps and system design through real improvements, not isolated tutorials.

The target outcome is a project that is:

- safer to change because important workflows are tested;
- reproducible locally because the stack can run with Docker;
- easier to release because CI checks every change;
- faster because one measured database bottleneck is improved;
- more useful on event day because important updates appear in real time.

## Scope rule

Do not add every possible technology. Every tool must solve a demonstrated problem.

- PostgreSQL remains the source of truth.
- Docker is for reproducible environments, not a reason to introduce Kubernetes.
- Redis is optional and comes only after a real queue or caching need is identified.
- WebSockets should begin with one focused workflow: live issues or task-status changes.
- Prefer a complete, documented vertical slice over broad feature accumulation.

## Two-week implementation plan

Assumption: 2–3 focused hours per day, five or six days per week.

### Days 1–4: Testing fundamentals

The goal is not high coverage. The goal is to protect Convene’s security boundaries and most important operational workflows.

#### Day 1 — Testing setup and concepts

Learn:

- unit vs integration vs end-to-end tests;
- Arrange → Act → Assert;
- test isolation, fixtures, and database cleanup;
- mocking external services such as Supabase Storage;
- HTTP status assertions and useful test names.

Resources:

- Read the [Supertest documentation](https://github.com/ladjs/supertest).
- Read the [Vitest getting-started guide](https://vitest.dev/guide/).
- Search for a current [Supertest + Express integration testing tutorial](https://www.youtube.com/results?search_query=Supertest+Express+integration+testing+Node.js).
- Search for a current [Vitest React testing tutorial](https://www.youtube.com/results?search_query=Vitest+React+testing+tutorial).

Implement:

- add the backend test runner and Supertest;
- add a frontend test runner for focused component tests;
- create a test environment configuration;
- create reusable test app/server setup;
- create database fixture and cleanup helpers;
- add one health-check/API smoke test.

Definition of done:

```text
npm test
```

runs successfully from the relevant workspace, and the setup is documented.

#### Day 2 — Authentication and event isolation

Learn:

- how to create authenticated test requests;
- how JWTs are passed to protected endpoints;
- the difference between `401 Unauthorized` and `403 Forbidden`;
- why every event-scoped query needs a cross-event test;
- how to test expired, missing, and malformed tokens.

Resources:

- Read the existing [Convene authentication middleware](backend/src/middlewares/auth.js).
- Read the [Supertest request API](https://github.com/ladjs/supertest#readme).
- Search for a current [Node.js JWT authentication testing tutorial](https://www.youtube.com/results?search_query=Node.js+JWT+authentication+testing+Supertest+tutorial).

Implement tests for:

- registration;
- successful login;
- invalid password;
- missing token;
- malformed or expired token;
- a member reading their own event;
- a member attempting to read another event;
- a non-member attempting to access an event.

Most important scenario:

```text
User A belongs to Event A.
User A requests Event B data.
Expected result: 403 or 404, never Event B data.
```

Create a reusable helper with a shape similar to:

```js
const { token, user, event } = await createAuthenticatedMember();
```

#### Day 3 — Tasks and issues

Learn:

- testing role-based behavior;
- testing valid and invalid request bodies;
- testing state transitions;
- testing assignment and ownership rules;
- testing duplicate submissions and edge cases.

Resources:

- Read the [Express testing guide](https://expressjs.com/en/advanced/best-practice-performance.html) for the production boundaries tests should protect.
- Inspect the existing [task routes](backend/src/routes/taskRoutes.js) and [issue routes](backend/src/routes/issueRoutes.js) before writing tests.
- Search for a current [Express authorization testing with Supertest tutorial](https://www.youtube.com/results?search_query=Express+authorization+testing+Supertest+roles+tutorial).

Implement task tests:

- organizer creates a task;
- missing title is rejected;
- assigned member must belong to the same event;
- assigned member can update their task status;
- unrelated member cannot update someone else’s task;
- organizer can update task status;
- invalid status is rejected.

Implement issue tests:

- event member can report an issue;
- missing title or invalid priority is rejected;
- rapid duplicate issue submission is handled;
- member can close an issue with feedback;
- missing resolution feedback is rejected;
- an issue from another event cannot be closed.

#### Day 4 — Frontend behavior and test quality

Learn:

- testing React behavior from the user’s perspective;
- testing forms, loading states, error states, and state transitions;
- mocking API responses without testing implementation details;
- avoiding brittle snapshots;
- checking that tests are independent and repeatable.

Resources:

- Read the [Testing Library guiding principles](https://testing-library.com/docs/guiding-principles/).
- Read the [React Testing Library introduction](https://testing-library.com/docs/react-testing-library/intro/).
- Search for a current [React Testing Library form testing tutorial](https://www.youtube.com/results?search_query=React+Testing+Library+form+testing+tutorial).

Implement one or two focused frontend tests:

- task status change updates the visible UI;
- issue form shows validation errors;
- loading and error states render correctly;
- an unauthorized API response triggers the expected session/error behavior.

Then improve the entire suite:

- remove duplicated setup code;
- group tests by route or workflow;
- give tests readable names;
- run tests independently and twice in succession;
- document how to run backend and frontend tests.

Definition of done for Days 1–4:

- authentication and event-isolation tests exist;
- task and issue workflows are covered;
- at least one high-value frontend interaction is covered;
- tests run with documented commands;
- failures produce useful output;
- tests do not depend on execution order;
- security boundaries matter more than a target coverage percentage.

### Day 5: Continuous integration

Create a GitHub Actions workflow that:

1. checks out the repository;
2. installs dependencies with the lockfile;
3. runs frontend and backend linting;
4. runs the test suite;
5. builds the frontend and validates the backend.

Add a status badge and document what must pass before merging.

### Days 6–7: Docker and reproducible development

Create a local Docker Compose setup for:

- frontend;
- backend API;
- PostgreSQL;
- optional supporting services only when needed.

Add:

- `.env.example` documentation;
- health checks;
- a database migration/seed workflow;
- clear startup and shutdown commands;
- a README section explaining container boundaries.

Do not put secrets in the image or commit environment files.

### Days 8–9: Database and API performance

Choose one data-heavy endpoint, preferably Mission Control, tasks, participants, or issues.

Measure:

- response time before the change;
- query count and relation loading;
- `EXPLAIN ANALYZE` output;
- payload size where relevant.

Then make the smallest useful improvement:

- add a justified Prisma/PostgreSQL index;
- reduce unnecessary relation fields;
- fix an N+1 query or repeated lookup;
- paginate a list if the endpoint needs it.

Record before/after measurements and the reason for the change.

### Days 10–14: One real-time workflow

Add live updates for one event-scoped workflow:

- a new issue appears without a refresh; or
- task status changes appear on Mission Control; or
- participant check-ins update an attendance indicator.

Implement:

- event-scoped rooms/channels;
- authenticated connection handling;
- server broadcast after a successful database write;
- frontend reconnect behavior;
- a visible stale/offline state;
- a fallback refresh path.

Do not attempt a general collaborative editor. The goal is reliable event-day signaling.

## Optional Redis track

Only add Redis after the core application works and a queue is justified.

Small learning scope:

- Redis as temporary infrastructure, not the primary database;
- one queue, one worker, and delayed jobs;
- retries with exponential backoff;
- failed-job visibility;
- behavior when Redis restarts.

Good first use cases:

- scheduled event reminders;
- report generation;
- notification delivery;
- background participant import processing.

Skip Redis Streams, clustering, Sentinel, Lua scripting, and advanced caching in this phase.

## System-design exercises

For each meaningful feature, write a one-page design note containing:

1. user problem and success metric;
2. API and data model;
3. normal request flow;
4. failure modes;
5. authorization boundary;
6. scaling limit;
7. simplest acceptable design;
8. what would change at 10x usage.

Suggested exercises:

- Why should a task-status broadcast happen only after the database update succeeds?
- What happens when two members update the same task at nearly the same time?
- How does the app behave if the WebSocket connection drops during an event?
- Which event-scoped indexes protect a large event from slowing down other events?
- When should a background job be retried, and when should it be marked permanently failed?

## Deliverables

- authorization-focused test suite;
- GitHub Actions CI workflow;
- Docker Compose local environment;
- one measured database optimization;
- one production-like real-time workflow;
- architecture diagram;
- failure-mode notes;
- setup and troubleshooting documentation;
- short demo showing the before/after behavior.

## Stretch project after Convene

Build a small uptime-monitoring service to explore DevOps and system design separately from the event domain.

MVP:

- add monitored URLs;
- run checks with a separate worker;
- store latency and failures;
- create incidents after repeated failures;
- send a webhook alert;
- display uptime history.

Start with a simple Node scheduler. Add Redis/BullMQ only when you can explain why the scheduler needs a durable queue.

## Recommended YouTube learning order

Watch only the sections needed for the current implementation, then immediately apply them.

### Docker

- [Docker Tutorial for Beginners — TechWorld with Nana](https://www.youtube.com/watch?v=3c-iBn73dDE)
- Focus on images, containers, Dockerfiles, Compose, volumes, networks, and health checks.

### GitHub Actions / CI

- [GitHub Actions Tutorial — TechWorld with Nana](https://www.youtube.com/watch?v=R8_veQiYBjI)
- Focus on workflows, jobs, triggers, secrets, caching, and build/test pipelines.

### System design

- [System Design Course for Beginners — ByteByteGo](https://www.youtube.com/watch?v=i53Gi_K3o7I)
- Focus on requirements, APIs, databases, queues, caching, reliability, and bottleneck analysis.

### Redis basics

- [Redis Crash Course — Traversy Media](https://www.youtube.com/watch?v=Hbt56gFj998)
- Watch only the data types, expiration, persistence, and practical application sections initially.

### BullMQ / Node.js queues

- [BullMQ in Node.js with Redis and Docker](https://www.youtube.com/watch?v=90WGktxfNUw)
- Focus on queue, job, worker, delayed jobs, retries, and failed-job handling.

### Testing

- Search for a current [Supertest + Express integration testing tutorial](https://www.youtube.com/results?search_query=Supertest+Express+integration+testing+Node.js)
- Search for a current [Vitest React testing tutorial](https://www.youtube.com/results?search_query=Vitest+React+testing+tutorial)

### WebSockets / real-time updates

- Search for a current [Socket.IO with React and Node.js tutorial](https://www.youtube.com/results?search_query=Socket.IO+React+Node.js+real-time+tutorial)
- Read the [Socket.IO documentation](https://socket.io/docs/v4/)
- Focus on authenticated connections, rooms, reconnection, acknowledgements, and broadcasting only after a database write succeeds.

### PostgreSQL and Prisma performance

- Read PostgreSQL’s [`EXPLAIN` documentation](https://www.postgresql.org/docs/current/using-explain.html)
- Read Prisma’s [indexing documentation](https://www.prisma.io/docs/orm/prisma-schema/data-model/indexes)
- Search for a current [PostgreSQL `EXPLAIN ANALYZE` tutorial](https://www.youtube.com/results?search_query=PostgreSQL+EXPLAIN+ANALYZE+indexes+tutorial)
- Search for a current [Prisma query optimization tutorial](https://www.youtube.com/results?search_query=Prisma+query+optimization+indexes+tutorial)

### Authentication and Google login

Convene already has JWT/password authentication and event-membership authorization. Treat Google login as an additional identity-provider flow, not a replacement for authorization.

Learn this sequence:

1. Google authenticates the user and returns an authorization result.
2. The backend verifies the Google identity and obtains a stable provider subject (`sub`).
3. Convene finds or creates its own local `User` record.
4. Convene issues its own session/token and continues using the existing event-membership checks.

Resources:

- Start with Google’s [Google Identity Services overview](https://developers.google.com/identity/gsi/web/guides/overview).
- Read Google’s [OAuth 2.0 web-server flow](https://developers.google.com/identity/protocols/oauth2/web-server).
- Read the [`google-auth-library` Node.js reference](https://cloud.google.com/nodejs/docs/reference/google-auth-library/latest).
- Search for a current [Google OAuth 2.0 Express Node.js tutorial](https://www.youtube.com/results?search_query=Google+OAuth+2.0+Express+Node.js+Google+Identity+Services+tutorial)
- Search for a current [JWT refresh-token security tutorial](https://www.youtube.com/results?search_query=Node.js+JWT+refresh+tokens+secure+tutorial)

Implementation checklist for a future Convene auth milestone:

- add `googleSubject`/provider identity storage with a unique constraint;
- validate the OAuth `state` value and redirect URI;
- verify the ID token server-side rather than trusting browser claims;
- never put the Google client secret in the frontend;
- link a Google identity to an existing account only through an explicit, verified flow;
- preserve `EventMembership` as the source of event authorization;
- test invalid tokens, account linking, duplicate identities, and cross-event access.

Do not begin by implementing refresh tokens, OAuth, and role changes simultaneously. First understand the identity flow, then add one provider while keeping the existing login path working.

### GitHub Actions and CI/CD

- Read GitHub’s [Node.js CI workflow guide](https://docs.github.com/en/actions/automating-builds-and-tests/building-and-testing-nodejs)
- Read the [GitHub Actions quickstart](https://docs.github.com/en/actions/quickstart)
- Search for a current [GitHub Actions Node.js CI/CD tutorial](https://www.youtube.com/results?search_query=GitHub+Actions+Node.js+CI+CD+tutorial)
- Focus on workflow triggers, jobs, caching, secrets, artifacts, and environment protection.

### Docker and Compose

- Read Docker’s [Get started documentation](https://docs.docker.com/get-started/)
- Read the [Docker Compose documentation](https://docs.docker.com/compose/)
- Search for a current [Docker Compose full-stack React Node PostgreSQL tutorial](https://www.youtube.com/results?search_query=Docker+Compose+React+Node+PostgreSQL+full+stack+tutorial)
- Focus on Dockerfiles, multi-stage builds, volumes, networks, health checks, and service dependencies.

### Redis and background jobs

- Read the [Redis documentation](https://redis.io/docs/latest/)
- Read the [BullMQ documentation](https://docs.bullmq.io/)
- Search for a current [Redis fundamentals Node.js tutorial](https://www.youtube.com/results?search_query=Redis+fundamentals+Node.js+tutorial+beginner)
- Use the linked BullMQ video only after you understand one queue and one worker.

### Deployment and operations

- Read Render’s [Node.js deployment documentation](https://render.com/docs/deploy-node-express-app)
- Read the [12-factor app principles](https://12factor.net/)
- Search for a current [Node.js production deployment Docker tutorial](https://www.youtube.com/results?search_query=Node.js+production+deployment+Docker+CI+CD+tutorial)
- Focus on environment configuration, health endpoints, logs, migrations, rollback, backups, and least-privilege secrets.

### Observability and reliability

- Read OpenTelemetry’s [JavaScript getting-started guide](https://opentelemetry.io/docs/languages/js/getting-started/nodejs/)
- Read the [Prometheus overview](https://prometheus.io/docs/introduction/overview/)
- Search for a current [Node.js structured logging and monitoring tutorial](https://www.youtube.com/results?search_query=Node.js+structured+logging+monitoring+metrics+tutorial)
- Start with structured logs, request IDs, a `/health` endpoint, and a small set of useful counters before adding a full metrics stack.

## Resource usage rule

Each topic has at least one video path and one documentation path above. Use the docs as the source of truth when a video is outdated. Watch only enough to unblock the next implementation step, then create an artifact in the repository: code, a test, a workflow, a diagram, a measurement, or a documented failure case.

## Learning rule

For every video, produce one artifact in the repository: a test, workflow, Docker service, measurement, diagram, or documented failure case. If a video does not lead to an artifact, stop watching and return to implementation.
