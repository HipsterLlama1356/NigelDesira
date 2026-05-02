# Plan: Build duo-dates — a date planning mobile app

## Context

The `NigelDesira` repository is currently empty (no commits, no files). The user wants a React Native mobile app for planning dates with their partner. The app needs to:

1. Browse curated date ideas with location/category info
2. Open Google Maps to find nearby venues for each idea
3. Save date ideas for later
4. Schedule a date and get a notification reminder + a downloadable `.ics` calendar file
5. Rebrand the project as `duo-dates`

The user also asked to "rename the file and repositories." The GitHub MCP scope is locked to `hipsterllama1356/nigeldesira`, so the GitHub repo rename must be done by the user via GitHub Settings — I'll document that step. Inside the repo, all branding (package name, app name, README) will use `duo-dates`. Pushes go to branch `claude/date-planning-app-aprSE`.

## Tech stack

- **Expo (React Native, TypeScript)** — easiest cross-platform setup, runs in Expo Go on iOS/Android without Xcode/Android Studio
- **React Navigation** (bottom tabs + native stack) — standard navigation
- **AsyncStorage** (`@react-native-async-storage/async-storage`) — persist saved ideas and scheduled dates
- **expo-notifications** — local push notifications for reminders
- **expo-file-system + expo-sharing** — write `.ics` to a temp file and open the share sheet so the user can save it to Calendar
- **React Native `Linking`** — open Google Maps search URLs

No external API keys required.

## File layout

```
duo-dates/                       (folder name; user renames on GitHub UI)
├── app.json                     Expo config: name "duo-dates", slug, icon, notifications plugin
├── package.json                 name "duo-dates"
├── tsconfig.json                strict TS
├── babel.config.js              expo preset
├── App.tsx                      Root: NavigationContainer + tab navigator + notification permission bootstrap
├── README.md                    What the app does, run instructions, repo-rename note
├── assets/                      icon.png, splash.png (placeholder PNGs)
└── src/
    ├── types.ts                 DateIdea, SavedIdea, ScheduledDate
    ├── data/ideas.ts            ~20 curated ideas across categories: Food, Outdoors, Indoor, Adventure, Cozy, Cultural
    ├── storage/storage.ts       getSaved, addSaved, removeSaved, getScheduled, addScheduled, removeScheduled (AsyncStorage)
    ├── notifications/notifications.ts  requestPermission, scheduleReminder, cancelReminder
    ├── calendar/ics.ts          buildIcs(date) -> string; exportIcs(date) -> share sheet
    ├── maps/maps.ts             openMapsSearch(query) using Linking + platform-aware URL
    ├── components/
    │   ├── IdeaCard.tsx         Card with emoji, title, category chip, duration
    │   └── EmptyState.tsx       Reusable empty-list placeholder
    └── screens/
        ├── BrowseScreen.tsx     Category filter chips + FlatList of IdeaCards
        ├── IdeaDetailScreen.tsx Title, description, "Find nearby on Maps" button, "Save" toggle, "Schedule a date" button → opens DateTimePicker
        ├── SavedScreen.tsx      List of saved ideas; tap → IdeaDetail
        └── ScheduledScreen.tsx  List of scheduled dates with live countdown, "Export .ics" button, "Cancel" button
```

## Key behaviors

- **Browse**: tabs at bottom (Browse, Saved, Scheduled). Browse shows a scrollable list grouped/filterable by category chips.
- **Map link out**: `IdeaDetailScreen` button calls `Linking.openURL("https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(idea.mapsQuery))`. Works on iOS and Android — opens Google Maps app if installed, otherwise the browser.
- **Save**: heart icon on detail screen toggles persistence in AsyncStorage under key `duo-dates:saved`.
- **Schedule**: opens `@react-native-community/datetimepicker`. On confirm: writes to `duo-dates:scheduled`, schedules an `expo-notifications` local notification at that timestamp, and stores the returned notification ID so it can be cancelled later.
- **Countdown**: `ScheduledScreen` uses a `useEffect` + `setInterval(..., 1000)` to update a live "in 2d 4h 13m" string per scheduled date.
- **ICS export**: `buildIcs` produces a minimal VCALENDAR/VEVENT string (UID = scheduled date id, SUMMARY = idea title, DESCRIPTION = idea description, DTSTART/DTEND in UTC). `exportIcs` writes it via `expo-file-system` to the cache dir as `<title>.ics` then calls `expo-sharing.shareAsync` so the user can hand it to Calendar / email / Drive.
- **Notifications**: at app startup, request permission once. Permission denial is non-blocking — scheduling still saves the date and offers the .ics export.

## Critical files (in order of writing)

1. `package.json`, `app.json`, `tsconfig.json`, `babel.config.js` — project scaffold
2. `src/types.ts`, `src/data/ideas.ts` — data model + seed ideas
3. `src/storage/storage.ts` — AsyncStorage wrappers
4. `src/notifications/notifications.ts`, `src/calendar/ics.ts`, `src/maps/maps.ts` — utilities
5. `src/components/IdeaCard.tsx`, `src/components/EmptyState.tsx`
6. `src/screens/*` — four screens
7. `App.tsx` — wire navigation + bootstrap
8. `README.md`
9. `.gitignore` — node_modules, .expo, dist

## Renaming

- **Inside the repo**: `package.json` → `"name": "duo-dates"`; `app.json` → `"name": "duo-dates"`, `"slug": "duo-dates"`; README headed `# duo-dates`.
- **Local folder**: I'll leave `/home/user/NigelDesira` as-is (renaming the cwd mid-session breaks tooling) and document the rename step in the README.
- **GitHub repo**: outside my MCP scope. README will include the steps: GitHub → repo → Settings → Rename to `duo-dates`, then `git remote set-url origin …`.

## Verification

- `npm install` resolves without peer-dep errors.
- `npx tsc --noEmit` passes (strict TS).
- `npx expo start` boots Metro; app loads in Expo Go (manual check the user can run after pulling).
- Manual smoke checklist (in README): browse list renders → tap idea → "Find nearby on Maps" opens maps → save → appears in Saved tab → schedule for ~1 min from now → notification fires → "Export .ics" opens share sheet → cancel removes from Scheduled tab.

## Out of scope

- No real-time Places API, no auth, no backend, no multi-user sync, no app-store builds. All data is on-device.
