# Tech Stack

Version: 1.0

---

# Philosophy

Convene should be built using modern, production-ready technologies that prioritize:

- Maintainability
- Scalability
- Developer Experience
- Performance
- Beautiful UI
- Type Safety

Avoid unnecessary complexity.

Every technology must solve a real problem.

---

# Overall Architecture

Frontend
↓

REST API

↓

Backend

↓

PostgreSQL

↓

Cloud Storage

---

# Frontend

Framework

React 19

Reason

- Industry Standard
- Large Ecosystem
- Excellent Component Architecture

---

Build Tool

Vite

Reason

- Extremely Fast
- Excellent DX
- Lightweight

---

Language

TypeScript

Reason

- End-to-end type safety
- Better autocomplete
- Easier refactoring
- Fewer runtime errors

TypeScript is mandatory.

No JavaScript.

---

Routing

React Router v7

Structure

/

/dashboard

/events

/events/:id

/participants

/tasks

/departments

/inventory

/resources

/issues

/analytics

/settings

---

Styling

Tailwind CSS v4

Rules

Use utility classes only for

- Layout
- Spacing
- Responsive Design

Do NOT create huge inline class strings.

Extract reusable components.

---

UI Library

shadcn/ui

Reason

Accessible

Beautiful

Composable

Production Ready

All primitive components should come from shadcn.

Examples

Button

Input

Dialog

Dropdown

Popover

Avatar

Badge

Table

Tabs

Tooltip

Calendar

Command Palette

---

Icons

Lucide React

Use one icon library only.

Never mix icon packs.

---

Animations

Framer Motion

Used for

Page transitions

Sidebar

Cards

Hover

Dialogs

Leaderboards

Timeline

Progress

No CSS animation libraries.

---

Forms

React Hook Form

Validation

Zod

Reason

Fast

Type Safe

Easy Validation

---

Data Fetching

TanStack Query

Responsibilities

Caching

Loading

Refetching

Optimistic Updates

Error Handling

Avoid manual fetch state.

---

Global State

Zustand

Only store

Current User

Current Event

Theme

Sidebar State

Notifications

Do NOT store server data.

Server state belongs to TanStack Query.

---

Charts

Recharts

Only use where necessary.

Avoid dashboards filled with graphs.

Analytics page only.

---

Notifications

Sonner

Use toast notifications.

Success

Error

Warning

Info

---

Backend

Runtime

Node.js

Framework

Express.js

Language

TypeScript

Mandatory.

---

API Style

REST

Version

/api/v1

Example

/api/v1/events

/api/v1/tasks

/api/v1/inventory

---

Authentication

JWT

Password Hashing

bcrypt

Future

OAuth

Google Login

Microsoft Login

---

Validation

Zod

Never trust frontend validation.

Always validate on server.

---

ORM

Prisma

Reason

Excellent TypeScript Support

Migration System

Readable Queries

Developer Experience

---

Database

PostgreSQL

Reason

Convene is highly relational.

Examples

One Event

↓

Many Departments

↓

Many Tasks

↓

Many Users

↓

Many Inventory Logs

SQL relationships fit this perfectly.

Avoid MongoDB.

---

Storage

Cloudinary

Used for

Logos

Documents

Rulebooks

Certificates

Participant Files

Submission Files

Images

Never store files inside PostgreSQL.

---

Caching

Redis

Future version.

Used for

Leaderboard

Notifications

Live Dashboard

Session Cache

---

Realtime

Socket.IO

Future

Live Dashboard

Issue Updates

Attendance

Task Updates

Leaderboard

---

Deployment

Frontend

Vercel

Backend

Railway

or

Render

Database

Neon PostgreSQL

Storage

Cloudinary

---

Testing

Frontend

Vitest

React Testing Library

Backend

Jest

E2E

Playwright

---

Folder Structure

Frontend

src/

app/

components/

features/

hooks/

layouts/

pages/

services/

store/

types/

utils/

assets/

Backend

src/

controllers/

routes/

middlewares/

services/

repositories/

prisma/

utils/

types/

validators/

config/

---

Naming Convention

Components

PascalCase

TaskCard.tsx

GlassCard.tsx

ParticipantTable.tsx

Hooks

camelCase

useTasks.ts

useInventory.ts

Utilities

camelCase

formatDate.ts

generateQR.ts

API Routes

Plural

/events

/tasks

/users

/departments

Files

kebab-case

event-service.ts

participant-controller.ts

---

Code Standards

Use functional components only.

No class components.

Use async/await.

Never use any.

Prefer interfaces.

Keep components under 250 lines.

Extract reusable logic into hooks.

Keep business logic outside components.

Never duplicate UI.

---

Performance

Lazy load pages.

Memoize expensive components.

Virtualize large participant tables.

Optimize images.

Debounce search.

Pagination for large datasets.

---

Security

Hash passwords.

Sanitize inputs.

Validate every request.

Protect routes.

Role-based authorization.

Secure file uploads.

Rate limiting.

Helmet middleware.

Environment variables only.

---

Accessibility

Keyboard navigation.

Focus states.

ARIA labels.

Screen reader support.

Minimum touch target 44px.

WCAG AA.

---

Browser Support

Latest Chrome

Edge

Safari

Firefox

Desktop First

Responsive for tablets.

Mobile support is secondary for Version 1.

---

Future Enhancements

PWA

Offline Mode

Electron Desktop App

Mobile App

Push Notifications

AI Insights

Calendar Integration

Email Automation

SSO

Webhooks

---

Technology Summary

Frontend

- React 19
- TypeScript
- Vite
- Tailwind CSS v4
- shadcn/ui
- Framer Motion
- React Router
- TanStack Query
- Zustand
- React Hook Form
- Zod
- Lucide React
- Sonner

Backend

- Node.js
- Express
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT
- bcrypt

Storage

- Cloudinary

Deployment

- Vercel
- Railway / Render
- Neon PostgreSQL

This stack should remain consistent throughout the project.