# Convene Design System

Version: 1.0

---

# Design Philosophy

Convene is not an admin dashboard.

It is an operating system for events.

The design should communicate calmness, focus and operational awareness rather than overwhelming the user with statistics.

The interface should feel handcrafted, premium and modern.

Every interaction should feel intentional.

---

# Inspiration

Primary

- Apple macOS Tahoe
- Apple Calendar
- Apple Wallet

Secondary

- Linear
- Arc Browser
- Vercel Dashboard
- Notion
- Attio CRM
- Plane.so
- Raycast

Avoid inspiration from

- Bootstrap Admin Templates
- Tailwind Admin Dashboards
- Crypto Dashboards
- ERP Systems
- Gaming UI

---

# Keywords

Minimal

Elegant

Glass

Floating

Premium

Calm

Soft

Professional

Modern

---

# Design Principles

1.

Whitespace is more valuable than decoration.

2.

Hierarchy over color.

3.

Typography before icons.

4.

Animation should support usability.

Never distract.

5.

Everything should feel lightweight.

6.

Avoid unnecessary charts.

7.

Every screen should answer

"What needs my attention?"

---

# Theme

Light Mode First

Dark Mode is optional.

Primary interface should be light.

---

# Color System

## Background

Primary

#F6F7FB

Secondary

#EEF2F7

Glass Surface

rgba(255,255,255,0.55)

Hover Surface

rgba(240,240,240,0.75)

Sidebar

rgba(255,255,255,0.65)

Border

rgba(255,255,255,0.35)

---

## Accent

Gold

#F6C445

Gold Hover

#E9B72D

---

## Success

#34C759

---

## Warning

#FF9F0A

---

## Error

#FF453A

---

## Info

#007AFF

---

## Text

Primary

#111827

Secondary

#6B7280

Muted

#9CA3AF

Placeholder

#D1D5DB

---

# Glassmorphism

All cards should use

background

rgba(255,255,255,0.55)

backdrop-filter

blur(22px)

border

1px solid rgba(255,255,255,0.4)

box-shadow

0 10px 40px rgba(0,0,0,0.08)

No heavy shadows.

No thick borders.

---

# Hover

Every interactive card

translateY(-3px)

background

rgba(245,245,245,0.72)

Shadow becomes slightly stronger.

Transition

250ms

ease

Hover should feel like the card is floating.

---

# Active

When selected

Gold border

Soft gold glow

Never use thick outlines.

---

# Radius

Cards

20px

Buttons

16px

Inputs

16px

Dialogs

28px

Modals

32px

Badges

999px

---

# Spacing System

Use only multiples of 8.

4

8

16

24

32

40

48

64

80

96

No random spacing.

---

# Layout

Maximum width

1600px

Content padding

32px

Gap

24px

Cards should never touch.

Generous breathing room.

---

# Grid

12-column grid.

Dashboard

Left Sidebar

Top Navigation

Main Content

Right Utility Area (optional)

Avoid stacking identical cards.

Mix widths.

---

# Typography

Font

Inter

---

Hero

42px

700

---

H1

32px

700

---

H2

24px

600

---

H3

20px

600

---

Body

16px

400

---

Small

14px

400

---

Caption

12px

500

---

# Icons

Lucide Icons

Stroke

1.75px

Consistent size

20

24

32

Never mix icon styles.

---

# Buttons

Primary

Gold

Rounded

Glass shadow

Height

44px

---

Secondary

Transparent Glass

---

Ghost

No background

Hover only

---

Danger

Soft Red

---

# Inputs

Glass

Rounded

16px

Soft placeholder

No hard borders

Focus

Blue glow

---

# Sidebar

Floating

Glass

Not attached to screen edge.

Collapsed

80px

Expanded

260px

Hover expands labels.

Active item

Gold pill

Smooth animation

---

# Navigation

Top Navigation

Search

Notifications

Current Event

Profile

Everything aligned.

---

# Cards

Cards should not all look identical.

Three card types

Hero Card

Information Card

List Card

Different heights.

Different hierarchy.

---

# Hero Card

Largest card.

Contains

Current Event

Stage

Countdown

Timeline

Beautiful.

Minimal.

---

# Metric Card

Simple.

Icon

Value

Subtitle

No charts.

No sparklines.

No graphs.

---

# Task Card

Priority badge

Title

Department

Assignee Avatar

Due Time

Status

Completion Animation

---

# Timeline

Horizontal

Current stage highlighted.

Animated progress.

Stages

Registration

Opening

Hackathon

Mentoring

Judging

Closing

---

# Tables

Rounded

No borders

Alternating hover

Sticky header

Searchable

Filterable

---

# Modals

Glass

Large

Rounded

Blur background

Scale animation

200ms

---

# Dropdown

Floating

Glass

Blur

Shadow

Rounded

---

# Animations

Library

Framer Motion

---

Duration

Fast

150ms

Medium

250ms

Slow

350ms

---

Hover

Scale

1.02

TranslateY

-2px

---

Page Transition

Fade

Slide

Spring

No abrupt changes.

---

Numbers

Animate upward.

---

Progress

Animated width.

---

Sidebar

Spring open.

---

Leaderboard

Smooth ranking animation.

---

# Motion

Everything should feel physical.

Use spring animations.

Avoid linear movement.

---

# Dashboard Philosophy

Dashboard is Mission Control.

Not Analytics.

Avoid

Huge charts

Pie charts

Random KPIs

Instead show

Today's Tasks

Current Stage

Upcoming Activities

Leaderboard

Quick Actions

Important Alerts

---

# Empty States

Beautiful illustrations.

Helpful text.

CTA button.

Never blank screens.

---

# Loading

Skeletons.

No spinners.

---

# Responsive

Desktop First.

Laptop

Tablet

Mobile

Sidebar becomes drawer.

---

# Accessibility

Contrast

AA compliant

Keyboard navigation

Focus states

Screen reader labels

Large click targets

Minimum 44px

---

# Overall Feeling

The interface should look like a product designed by Apple and Linear together.

Users should immediately think

"This feels premium."

Never

"This looks like another college dashboard."

Every page should feel calm, intentional and beautifully spaced.