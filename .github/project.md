---
description: Project description
alwaysApply: true
---

# Project **Time Loch**

## Overview

**Time Loch** is an advanced metronome web application designed specifically for musicians, with a strong focus on the band **Devon Loch**.

The name is a wordplay between:

- **Devon Loch**, the band name
- **Time Lock**, the act of locking tempo and rhythm during performance

The application is designed to help musicians **structure songs into clearly defined, tempo-accurate sections**, rehearse transitions, and practice entire arrangements with maximum rhythmic precision and consistency.

---

## Target Platform

- **Progressive Web App (PWA)**

  - Fully functional offline
  - Installable on mobile devices

- **Mobile-first**, responsive web application
- Optimized for rehearsal usage (phone on the floor, fast interactions, minimal visual noise)

---

## Tech Stack

- **TypeScript**
- **React**
- **Vite**
- **Tailwind CSS**
- **shadcn/ui**
- **Zustand**

  - UI state (navigation, dialogs, playback state)
  - Application state (songs, sections, metronome configuration, persistence)

- **Tone.js**

  - Sample-accurate timing and scheduling
  - Accent handling and subdivisions
  - Multiple metronome sound profiles (classic clicks, percussive clicks, etc.)

---

## Core Concepts

### Song

A **Song** represents the full musical structure of a piece and acts as a container for ordered sections and rehearsal notes.

### Section

A **Section** represents a musically meaningful and indivisible part of a song (e.g. intro, verse, chorus, bridge).

Each section defines:

- Tempo (BPM)
- Time signature
- Duration (expressed as a fixed number of measures)
- Metronome accent pattern

A **section always starts from its first measure**.
Partial section playback is **not supported by design**.

---

## Playback Model

Time Loch provides **deterministic, non-ambiguous playback behavior**.
At any time, **only one playback can be active**.

### Song-Level Playback

- Triggered by the **Song Play button**
- Always:

  - Starts from the **first section**
  - Plays all sections **in order**
  - Uses each section’s own tempo, meter, and duration

- Playback:

  - **Never resumes**
  - **Never starts from the middle of a section**
  - Stops automatically after the last section ends

Song-level playback is intended for rehearsing the **entire song from start to finish**.

---

### Section-Level Playback

- Triggered by the **Play button on a section**
- Always:

  - Starts from the **first measure of the selected section**
  - Continues playing **that section and all following sections in order**
  - Stops automatically at the end of the song

- Section playback:

  - Never loops
  - Never resumes
  - Never starts from a partial measure or beat

Section-level playback is intended for rehearsing **specific entry points** in the song while preserving realistic transitions.

---

### Stop Behavior

- A **global Stop button** is shown while any playback is active
- Stop:

  - Immediately halts **any current playback**
  - Resets the metronome state

- While playback is active:

  - **No play buttons are enabled**
  - The only available action is **Stop**

This guarantees a predictable, rehearsal-safe interaction model.

---

## Features

Light and dark mode

- The user can choose the theme
- The theme is persisted in the browser
- The theme is applied to the entire application

### Song Management

- Create, read, update, delete songs
- Songs are persisted locally (offline-first)
- Each song supports free-form notes

### Section Management

- Create, read, update, delete sections within a song
- Sections are ordered and immutable during playback
- Each section includes:

  - BPM
  - Time signature
  - Number of measures
  - Section-level play (starts from the beginning of the section)

---

## Pages & UX

### Home Page

- Displays the list of songs
- **Tap** a song → open Song Page
- **Long-press** a song → delete
- Action to create a new song

---

### Song Page

- Displays:

  - Song title
  - Song notes

- Displays the ordered list of sections
- Each section row shows:

  - BPM
  - Time signature
  - Number of measures
  - Section Play button

- **Long-press** on a section → delete
- Action to add a new section
- Global Play / Stop control for the song

---

### About Page

- Information about **Devon Loch**
- Links to:

  - Official website
  - Social media profiles

- Information about the application
- Link to the developer’s website

---

## Design Philosophy

- Minimal, distraction-free UI
- One-hand operation on mobile devices
- Clear hierarchy: **tempo → meter → structure**
- Audio precision takes priority over visual effects
- Explicit, deterministic control over musical structure
- No implicit behavior, no hidden state, no “magic timing”
