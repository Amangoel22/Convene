# UI Architecture

Version: 1.0

---

# Philosophy

Convene should feel like an operating system for events.

Every page should answer one question clearly.

Avoid clutter.

Avoid unnecessary charts.

Avoid oversized KPI cards.

Every page should have one obvious primary focus.

---

# Application Layout

Every page follows the same layout.

┌────────────────────────────────────────────────────────────┐
│ Navbar                                                     │
├──────────────┬─────────────────────────────────────────────┤
│              │                                             │
│ Sidebar      │ Main Content                               │
│              │                                             │
│              │                                             │
└──────────────┴─────────────────────────────────────────────┘

Sidebar remains visible.

Navbar remains visible.

Only main content changes.

---

# Sidebar

Contains

Mission Control

Participants

Tasks

Departments

Run of Show

Inventory

Resources

Issues

Analytics

Settings

Footer

Current User

Theme Toggle

Version

Sidebar should be floating.

Rounded.

Glass.

Collapsible.

---

# Navbar

Contains

Current Event

Search

Notifications

Theme Toggle

Profile

Breadcrumb

Page Title

Always sticky.

---

# Dashboard (Mission Control)

Purpose

Provide organizers with an overview of the current event.

Sections

Hero

↓

Metrics

↓

Tasks

↓

Leaderboard

↓

Schedule

↓

Quick Actions

---

## Hero Section

Largest component.

Contains

Current Event

Current Stage

Countdown

Progress Timeline

Current Date

Live Badge

Primary CTA

---

## Metrics

Four compact cards.

Participants

Pending Tasks

Open Issues

Departments Active

No charts.

No sparklines.

Icon

Value

Label

Only.

---

## Tasks

Today's Tasks.

Compact list.

Priority

Status

Due Time

Department

Assignee

Quick Complete

---

## Leaderboard

Top Organizers

Avatar

XP

Tasks Completed

Reliability

Achievement Badge

Maximum

5 users.

---

## Schedule

Today's Schedule

Current Activity

Upcoming Activities

Timeline

Current stage highlighted.

---

## Quick Actions

Large Buttons

Import Participants

Create Task

Assign Duty

Report Issue

---

# Participants Page

Purpose

Manage imported participants.

Layout

Header

↓

Toolbar

↓

Participant Table

↓

Side Drawer

---

Toolbar

Search

Filters

Import CSV

Export

---

Participant Table

Team

Leader

College

Status

Accommodation

QR

Actions

---

Drawer

Participant Details

Team Members

Project

Accommodation

Attendance

Certificates

Feedback

---

# Tasks Page

Purpose

Manage all tasks.

Layout

Toolbar

↓

Kanban Board

↓

Task Details

Toolbar

Search

Filter

Department

Priority

Status

Kanban

Todo

In Progress

Blocked

Done

---

# Departments

Department Cards

↓

Members

↓

Responsibilities

↓

Tasks

Each department

Glass Card

Manager

Members

Completion

Pending Tasks

---

# Run of Show

Purpose

Display the live event timeline.

Layout

Timeline

↓

Current Stage

↓

Upcoming Stage

↓

Completed Stages

Horizontal timeline.

Current stage highlighted.

---

# Inventory

Purpose

Track physical resources.

Layout

Search

↓

Category Chips

↓

Inventory Grid

↓

Checkout History

Inventory Card

Item

Quantity

Available

Issued

Issue Button

Return Button

---

# Resource Vault

Purpose

Central document repository.

Categories

Logos

Rulebooks

Sponsors

Posters

Contacts

Misc

Grid layout.

---

# Issues

Purpose

Track operational issues.

Layout

Issue List

↓

Issue Details

↓

History

Issue Card

Priority

Department

Assigned To

ETA

Status

---

# Analytics

Simple.

Avoid dashboard syndrome.

Sections

Attendance

Feedback

Task Completion

Inventory Usage

Volunteer Contribution

Mostly tables.

Minimal charts.

---

# Settings

Organization

Users

Permissions

Events

Appearance

Notifications

Danger Zone

---

# Component Hierarchy

App

↓

Layout

↓

Sidebar

Navbar

↓

Page

↓

Section

↓

Cards

↓

Reusable Components

---

# Reusable Components

GlassCard

GlassButton

GlassSidebar

GlassNavbar

MetricCard

TaskCard

LeaderboardCard

Timeline

QuickActionCard

UserAvatar

PriorityBadge

StatusBadge

SearchBar

SectionHeader

PageHeader

EmptyState

LoadingSkeleton

ConfirmationModal

---

# Empty States

Every page must have a designed empty state.

Never show blank pages.

Always include

Illustration

Description

Primary CTA

---

# Loading States

Skeleton loaders only.

Never use spinners.

---

# Responsiveness

Desktop First.

Laptop

Tablet

Mobile

Sidebar becomes drawer on mobile.

---

# Navigation Philosophy

Maximum three clicks to reach any feature.

Consistent spacing.

Consistent headers.

Consistent actions.

No duplicated navigation.

---

# Design Goal

Every page should feel like it belongs to the same product.

The experience should resemble Linear, Notion and Apple applications rather than a generic admin dashboard.

The interface should prioritize clarity, focus and operational awareness.