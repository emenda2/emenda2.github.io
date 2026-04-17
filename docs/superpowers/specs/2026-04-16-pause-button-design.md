# Pause Button — Design Spec
_Date: 2026-04-16_

## Overview

A floating PAUSE button lets the user freeze all running stopwatches mid-workout (e.g., a phone call, a long queue for equipment). Paused time is excluded from the session total logged to Google Sheets.

---

## State

Three new fields added to `state` in `app.js`:

| Field | Initial value | Purpose |
|-------|--------------|---------|
| `isPaused` | `false` | Whether the app is currently paused |
| `pauseStartTime` | `null` | Wall-clock timestamp when current pause began |
| `totalPausedMs` | `0` | Cumulative paused duration across all pauses this session |

---

## UI

- A `<button id="pause-btn">` added to `index.html`
- Fixed position, bottom-right corner, above the footer
- Styled as a pill: dark surface (`var(--surface)`), green border and text (`var(--green)`)
- Only visible once a workout has started (`state.workoutStartTime` is set) and not all exercises are done
- Label: **PAUSE** when active, **RESUME** when paused

---

## Pause Behaviour

When the user taps PAUSE:

1. `state.isPaused = true`, `state.pauseStartTime = Date.now()`
2. Stop the tick loop (`clearInterval` / null out `_tickInterval`)
3. Call `_audioCtx?.suspend()` — freezes the audio clock, keeping scheduled rest beeps queued at the correct relative positions for when the context resumes
4. Update every active (non-idle, non-done) card's stopwatch label to `"PAUSED"`
5. Button label → **RESUME**

---

## Resume Behaviour

When the user taps RESUME:

1. `pauseDuration = Date.now() - state.pauseStartTime`
2. `state.totalPausedMs += pauseDuration`
3. For every active card: `swState.startTime += pauseDuration` — shifts the reference point so `Date.now() - startTime` gives the same elapsed time as before the pause
4. `state.isPaused = false`, `state.pauseStartTime = null`
5. Call `_audioCtx?.resume()` — audio clock resumes; beeps fire at their correct audio-clock times
6. Restore each active card's label from `swState` (e.g., "SET 2 / 4", "REST")
7. Restart the tick loop
8. Button label → **PAUSE**

---

## Session Total Correction

In `triggerSync()`, the session total currently computes:

```js
total_workout_time_s: Math.round((now - workoutStartTime) / 1000)
```

This is updated to subtract paused time:

```js
total_workout_time_s: Math.round((now - workoutStartTime - state.totalPausedMs) / 1000)
```

---

## Audio Note

Pausing suspends the `AudioContext`. The Web Audio clock freezes — scheduled oscillators do not fire while suspended and resume firing at the correct audio-clock-relative times when the context is resumed. No beep cancellation or rescheduling is needed on pause/resume.

---

## Files Touched

| File | Change |
|------|--------|
| `index.html` | Add `<button id="pause-btn">` |
| `style.css` | Add `#pause-btn` style (fixed position, bottom-right) |
| `app.js` | Add pause/resume state fields, `pauseWorkout()` / `resumeWorkout()` functions, bind button, fix session total in `triggerSync()` |

---

## Out of Scope

- Per-exercise pause (all-or-nothing only)
- Pause persisting across app close/reopen
- Pause indicator on individual cards beyond the label change
