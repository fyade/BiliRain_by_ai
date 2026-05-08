# BiliRain - Bilibili Creator Update Calendar

Track the activity of Bilibili creators you follow, displayed in an intuitive monthly calendar view.

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Features

- **Three-Column Layout**: Creator management (left) + monthly calendar (center) + activity feed (right), fully synchronized
- **Creator Management**: Add by UID or profile URL, group management (CRUD), search and filter
- **Calendar View**: Monthly grid showing creator avatars on days with updates, click a day to view details
- **Activity Type Filtering**: Filter by video, image post, article, live stream, and more
- **Data Refresh**: Refresh current month, today only, selected creators, or force refresh all
- **Local Storage**: All data stored as JSON files, no database required
- **Privacy**: Bilibili cookies stored locally only, all API requests proxied through the server

## Usage

1. Click the gear icon (top-left) → paste your Bilibili cookie → save
2. Click "+ Add" → enter a creator's UID or profile URL → choose a group → confirm
3. The calendar auto-loads activity data; creator avatars appear on dates with updates
4. Click a calendar cell → the activity feed for that date appears on the right
5. Click group labels to filter creators, all three columns sync together
6. Use the "⋯" menu (bottom-right) for various refresh options

## Tech Stack

Next.js 16 + React 19 + TypeScript + Tailwind CSS v4
