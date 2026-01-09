# Board Turn Helper

Mobile app (Angular 21 + Ionic 8 + Capacitor) to support board games and quickly decide:

- first player
- turn order
- team split

The app works offline and is designed for direct multi-touch on phone/tablet, with multiple players touching the screen at the same time.

---

## Features

- Modes: first player, turn order, teams
- Multi-touch input with on-screen circles
- 5 second countdown, then input freeze and result calculation
- Result overlays (crown, numbers, team colors)
- Result stays visible until the user taps Restart
- Theme toggle (dark/light)
- Color mode: fixed palette or random palette
- No backend, no persistence

---

## How it works

1. Select a mode from the home screen.
2. Players touch the screen.
3. After the 5s countdown, the input freezes and the result is computed.
4. Tap Restart to clear the result and play again.

---

## Tech stack

- Angular 21
- Ionic 8
- Capacitor 8

---

## Relevant structure

src/app
core
models
mode.model.ts
player.model.ts
result.model.ts
services
color.service.ts
theme.service.ts
audio.service.ts
features
home
mode
mode.page.ts
mode.page.html
modes
first-player.mode.ts
turn-order.mode.ts
teams.mode.ts
random.util.ts
colors
shared
components
touch-surface

---

## Routes

- /home
- /mode/:id (first, order, teams)
- /colors

---

## Development

```bash
ionic serve --host=0.0.0.0
```
