# RahatSetu — Disaster Response & Coordination Platform

**Smart India Hackathon 2026 · Problem Statement 26043**

RahatSetu (राहतसेतु — "Relief Bridge") is a smart disaster response platform that connects citizens, universities, industry, and government into one shared workflow — from a citizen's first report to measured on-ground impact.

## The Problem

During disasters, relief is slow because information, expertise, and resources live in silos. Reports get lost in call centers, capable researchers and companies are never notified, and agencies lack a single live picture of what is happening.

## The Solution

A single shared problem lifecycle spanning four roles:

**Citizen** → reports a problem (text, photo, location) → the AI triages severity/priority
**Government** → verifies reports and routes them to capable partners
**University (HEI)** → forms student teams and builds prototypes against matched challenges
**Industry** → pledges cloud credits, expertise, funding, and field support (CSR-compliant)

Every role sees the **same live data** — no silos.

## Lifecycle

```
Reported → AI Analyzed → Verified → Matched → Collaborating → Prototype → Pilot → Deployed → Impact Measured
```

## Features

- 4-role dashboard suite (Citizen, Government, University, Industry) with a shared state persisted in IndexedDB
- **AI Problem Triage** — heuristic severity/priority scoring, category detection, recommended expertise
- **Matching Engine** — weighted university & industry partner scoring per problem
- **Report-A-Problem wizard** — describe, pin location on a live map, attach photo evidence, AI review
- **Live Disaster Map** — severity-coded incident pins (Leaflet + OpenStreetMap)
- **Government Command Center** — AI priority queue with verify/reject, live SOS monitor
- **Student Teams** — talent pool and team assembly against active challenges
- **Active Projects** — milestone-based project tracking shared across roles
- **Offline-first** — reports queue in IndexedDB and sync when connectivity returns
- **Trilingual UI** — English / हिन्दी / ગુજરાતી switcher
- Recharts analytics on every dashboard

## Tech Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4 (CSS-first `@theme` tokens)
- React Router 7, Recharts, Leaflet / react-leaflet
- IndexedDB via `idb` for offline persistence

> Note: AI triage and partner matching are deterministic demos (keyword/heuristic driven). All data is simulated for the hackathon demo.

## Getting Started

```bash
npm install
npm run dev      # start dev server
npm run build    # production build
npm run lint     # oxlint
```

Preview the production build:

```bash
npm run build
npx serve dist -p 4173 -s
```

## Demo Scenario

"Ahmedabad Urban Flooding (July 2024)" is pre-loaded: a citizen report flows through AI analysis → AMC verification → IIT Gandhinagar team match → Tata Communications / AWS pledges → active project with milestones.