# Arla Port Screens

React/Firebase display system for warehouse screens. The app uses Supabase for live data and Firebase Hosting for deployment.

## Current Production

- Main display selector: https://arla-port-screens.web.app/
- Torget display: https://arla-port-screens.web.app/TorgetDisplay
- Torget admin: https://arla-port-screens.web.app/TorgetEditPage
- Port admin: https://arla-port-screens.web.app/PortEditPage
- Specialen admin: https://arla-port-screens.web.app/SpecialenEditPage

## Important Routes

- `/` - display/device selection page.
- `/TorgetDisplay` - live Torget screen for warehouse display devices.
- `/TorgetEditPage` - Torget admin page, opened directly by URL.
- `/PortDisplay/:portNr` - live port display.
- `/PortEditPage` - port admin page.
- `/SpecialenDisplay` - Specialen display placeholder.
- `/SpecialenEditPage` - Specialen admin placeholder.

## Supabase Scope

The live warehouse system is already in use. For the current Torget work, only these tables should be changed:

- `torget`
  - `id`
  - `rootNr`
- `torg_msg`
  - `id`
  - `created_at`
  - `msg_text`
  - `duration_minutes`

Avoid changing `Port_Screens` unless the warehouse port system is intentionally being worked on.

## Torget Features

### Display

- Shows 11 lanes in one horizontal row.
- Route numbers scale to fit each lane.
- No active message: lane board is centered and uses the available screen space.
- Active message: message appears above the lane board.
- Message text auto-fits for longer messages.
- Layout is responsive across different display sizes.

### Admin

- Swedish admin UI.
- Direct URL only: `/TorgetEditPage`.
- Edit each lane route number individually.
- Send timed Torget messages.
- Clear active messages.
- Mobile responsive for phone-based administration.

## Local Development

Install dependencies:

```bash
npm install
```

Start local dev server:

```bash
npm start
```

On Windows PowerShell, if scripts are blocked, use:

```bash
npm.cmd start
```

Local app URL:

```text
http://localhost:3000
```

## Build

```bash
npm run build
```

Windows PowerShell alternative:

```bash
npm.cmd run build
```

## Deployment

The app is configured for Firebase Hosting.

Firebase project:

```text
arla-port-screens
```

Build and deploy:

```bash
npm run build
firebase deploy --only hosting
```

Windows PowerShell alternative:

```bash
npm.cmd run build
firebase.cmd deploy --only hosting
```

Firebase config files:

- `firebase.json`
- `.firebaserc`

## Notes For Future Development

- Keep display pages stable and readable on warehouse screens.
- Admin/edit pages can be optimized separately for mobile use.
- Do not commit `build/`, `node_modules/`, `.firebase/`, local dev logs, or Firebase debug logs.
- Test Torget display at multiple viewport sizes when changing layout.
- Be careful with live Supabase writes. Avoid test writes unless explicitly approved.
