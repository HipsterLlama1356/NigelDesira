# duo-dates

A React Native (Expo) mobile app for planning dates with your partner. Browse curated date ideas, find venues nearby on Google Maps, save ideas for later, schedule a date with a notification reminder, and export the date as an `.ics` file for Google Calendar / Apple Calendar.

No backend, no API keys. Everything is on-device.

## Features

- **Browse** ~20 curated date ideas across six categories (Food, Outdoors, Indoor, Adventure, Cozy, Cultural)
- **Find nearby** — every idea has a "Find nearby on Google Maps" button that opens Maps with a relevant search
- **Save** ideas with a heart toggle, persisted on-device
- **Schedule** a date and time, with a local push-notification reminder
- **Live countdown** for upcoming dates (updates every second)
- **Export `.ics`** so the date drops straight into Google / Apple Calendar
- **Cancel** a scheduled date and the reminder is cancelled too

## Run it

```sh
npm install
npx expo start
```

Open Expo Go on your phone and scan the QR code. (iOS and Android both work; notifications require granting permission on first launch.)

Type-check:

```sh
npm run typecheck
```

## Smoke test checklist

1. Browse tab loads with category chips and ideas.
2. Tap an idea → detail screen opens.
3. Tap **Find nearby on Google Maps** → Google Maps opens with a search.
4. Tap the heart → idea appears in the **Saved** tab.
5. Tap **Schedule a date** → pick a date about 1 minute ahead, then a time → confirm.
6. Notification fires at the scheduled time.
7. **Scheduled** tab shows a live countdown.
8. Tap **Export .ics** → share sheet opens; save to Calendar.
9. Tap **Cancel** → entry disappears and the reminder is cancelled.

## Project layout

```
App.tsx                  Navigation + bootstrap
src/
  types.ts               TypeScript types
  theme.ts               Colors + spacing
  data/ideas.ts          20 curated date ideas
  storage/storage.ts     AsyncStorage wrappers
  notifications/         expo-notifications wrapper
  calendar/ics.ts        ICS file generation + share sheet
  maps/maps.ts           Google Maps deep-link helper
  components/            IdeaCard, EmptyState, Button
  screens/               Browse, IdeaDetail, Saved, Scheduled
docs/
  PLAN.md                Original implementation plan (also handy for AI tools)
  PLAN.html              Same plan formatted for "Print to PDF" on a phone
```

## Renaming the GitHub repo

The repo is currently named `NigelDesira`. To rename it to `duo-dates`:

1. On GitHub, go to **Settings** → scroll to **Repository name** → enter `duo-dates` → **Rename**.
2. On your machine:

   ```sh
   git remote set-url origin git@github.com:<your-username>/duo-dates.git
   # then optionally rename the local folder:
   cd ..
   mv NigelDesira duo-dates
   cd duo-dates
   ```

The package name (`package.json`), Expo app name (`app.json`), bundle identifiers, and README all already use `duo-dates`.

## Reading the plan on your phone

`docs/PLAN.md` contains the full design. Open it in the GitHub mobile app, or open `docs/PLAN.html` in a mobile browser and use the share menu → **Print** → **Save as PDF** if you need a PDF copy for another AI.
