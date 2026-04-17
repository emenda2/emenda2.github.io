# Pause Button Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a floating PAUSE/RESUME button (bottom-right) that freezes all running stopwatches and the audio clock, then resumes them correctly, and excludes paused time from the session total sent to Sheets.

**Architecture:** Two new functions `pauseWorkout()` and `resumeWorkout()` in `app.js` manage a three-field pause state (`isPaused`, `pauseStartTime`, `totalPausedMs`). On pause, the tick loop stops and `AudioContext.suspend()` freezes scheduled beeps in place. On resume, each active card's `startTime` is shifted forward by the pause duration so elapsed calculations need no changes. Session total is corrected by adding `totalPausedMs` to `workoutStartTime` before passing to `buildSessionSummary`.

**Tech Stack:** Vanilla JS, Web Audio API, Jest (existing suite must stay green).

---

### Task 1: Add pause button element and styles

**Files:**
- Modify: `index.html`
- Modify: `style.css`

No tests — HTML/CSS only. Verify visually.

- [ ] **Step 1: Add the button to `index.html`**

Add `<button id="pause-btn" class="hidden">PAUSE</button>` directly before the closing `</body>` tag (after `</footer>`):

```html
  <footer id="app-footer">
    <button id="finish-early-btn" class="hidden">Finish Early</button>
  </footer>

  <button id="pause-btn" class="hidden">PAUSE</button>

  <script src="config.js"></script>
```

- [ ] **Step 2: Add `#pause-btn` style to `style.css`**

Add after the `#finish-early-btn` block:

```css
#pause-btn {
  position: fixed;
  bottom: 68px;
  right: 16px;
  background: var(--surface);
  color: var(--green);
  border: 1px solid var(--green);
  border-radius: 20px;
  padding: 10px 20px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 1px;
  z-index: 50;
}
```

- [ ] **Step 3: Run tests to confirm nothing broke**

```
npx jest
```

Expected: all 23 tests pass.

- [ ] **Step 4: Commit**

```bash
git add index.html style.css
git commit -m "feat: add pause button element and styles"
```

---

### Task 2: Implement pause/resume logic in `app.js`

**Files:**
- Modify: `app.js`

`app.js` has no test file — existing test suite (storage, logger, stopwatch) must remain green. Verify behaviour manually after this task.

- [ ] **Step 1: Add pause state fields to the `state` object**

Find the `state` object at the top of `app.js`:

```js
const state = {
  activeDay: 'A',
  activeGymIndex: 0,
  workoutStartTime: null,
  lastResetDate: null,
  cardStates: {},
};
```

Replace it with:

```js
const state = {
  activeDay: 'A',
  activeGymIndex: 0,
  workoutStartTime: null,
  lastResetDate: null,
  cardStates: {},
  isPaused: false,
  pauseStartTime: null,
  totalPausedMs: 0,
};
```

- [ ] **Step 2: Add `updatePauseButton()` function**

Add the following function immediately after the `updateGymToggleUI` function (around line 70):

```js
function updatePauseButton() {
  const btn = document.getElementById('pause-btn');
  const exercises = CONFIG.days[state.activeDay];
  const anyStarted = state.workoutStartTime !== null;
  const allDone = exercises.every(ex => {
    const s = state.cardStates[ex.name];
    return s && s.phase === 'done';
  });
  btn.classList.toggle('hidden', !anyStarted || allDone);
  btn.textContent = state.isPaused ? 'RESUME' : 'PAUSE';
}
```

- [ ] **Step 3: Add `pauseWorkout()` and `resumeWorkout()` functions**

Add both functions immediately after `updatePauseButton()`:

```js
function pauseWorkout() {
  state.isPaused = true;
  state.pauseStartTime = Date.now();

  clearInterval(_tickInterval);
  _tickInterval = null;

  if (_audioCtx) _audioCtx.suspend();

  document.querySelectorAll('.exercise-card:not(.done)').forEach(card => {
    const swState = state.cardStates[card.dataset.exercise];
    if (swState && swState.phase !== 'idle' && swState.phase !== 'done') {
      card.querySelector('.stopwatch-label').textContent = 'PAUSED';
    }
  });

  updatePauseButton();
}

function resumeWorkout() {
  const pauseDuration = Date.now() - state.pauseStartTime;
  state.totalPausedMs += pauseDuration;
  state.isPaused = false;
  state.pauseStartTime = null;

  Object.values(state.cardStates).forEach(swState => {
    if (swState.phase !== 'idle' && swState.phase !== 'done' && swState.startTime !== null) {
      swState.startTime += pauseDuration;
    }
  });

  if (_audioCtx) _audioCtx.resume();

  document.querySelectorAll('.exercise-card:not(.done)').forEach(card => {
    const swState = state.cardStates[card.dataset.exercise];
    if (swState && swState.phase !== 'idle' && swState.phase !== 'done') {
      card.querySelector('.stopwatch-label').textContent = swLabelText(swState);
    }
  });

  startTickLoop();
  updatePauseButton();
}
```

- [ ] **Step 4: Block stopwatch taps while paused**

In `onStopwatchTap()`, add an early return after the `done` guard:

```js
function onStopwatchTap(exercise, card) {
  const prev = state.cardStates[exercise.name];
  if (prev.phase === 'done') return;
  if (state.isPaused) return;
  // ... rest of function unchanged
```

- [ ] **Step 5: Call `updatePauseButton()` alongside `updateFinishEarlyButton()`**

There are two places `updateFinishEarlyButton()` is called: inside `onStopwatchTap()` and inside `renderCards()`. Add `updatePauseButton()` right after each call.

In `onStopwatchTap()`, find:

```js
  updateFinishEarlyButton();
  checkWorkoutComplete();
```

Replace with:

```js
  updateFinishEarlyButton();
  updatePauseButton();
  checkWorkoutComplete();
```

In `renderCards()`, find:

```js
  updateFinishEarlyButton();
```

Replace with:

```js
  updateFinishEarlyButton();
  updatePauseButton();
```

- [ ] **Step 6: Reset pause state on new calendar day in `renderCards()`**

In `renderCards()`, find the block that resets state on a new day:

```js
  if (state.lastResetDate !== todayStr) {
    state.cardStates = {};
    state.workoutStartTime = null;
    state.lastResetDate = todayStr;
  }
```

Replace with:

```js
  if (state.lastResetDate !== todayStr) {
    state.cardStates = {};
    state.workoutStartTime = null;
    state.lastResetDate = todayStr;
    state.isPaused = false;
    state.pauseStartTime = null;
    state.totalPausedMs = 0;
  }
```

- [ ] **Step 7: Correct session total in `triggerSync()` to exclude paused time**

In `triggerSync()`, find:

```js
  const sessionRow = buildSessionSummary(
    state.activeDay,
    gymName,
    state.workoutStartTime,
    completedExercises.map(ex => ex.name),
    now
  );
```

Replace with:

```js
  const sessionRow = buildSessionSummary(
    state.activeDay,
    gymName,
    state.workoutStartTime + state.totalPausedMs,
    completedExercises.map(ex => ex.name),
    now
  );
```

_(Adding `totalPausedMs` to `workoutStartTime` shifts the reference point forward, so `now - (workoutStartTime + totalPausedMs)` = net active workout time.)_

- [ ] **Step 8: Bind the pause button in `DOMContentLoaded`**

In the `DOMContentLoaded` listener, find:

```js
  document.getElementById('finish-early-btn').addEventListener('click', () => {
    triggerSync();
  });
```

Add after it:

```js
  document.getElementById('pause-btn').addEventListener('click', () => {
    if (state.isPaused) resumeWorkout();
    else pauseWorkout();
  });
```

- [ ] **Step 9: Run tests to confirm nothing broke**

```
npx jest
```

Expected: all 23 tests pass.

- [ ] **Step 10: Commit**

```bash
git add app.js
git commit -m "feat: implement pause/resume workout logic"
```

---

### Task 3: Manual verification

- [ ] Open the app in a browser (serve `index.html` locally or open directly)
- [ ] Tap any stopwatch to start — verify PAUSE button appears bottom-right
- [ ] Tap PAUSE — verify all active labels show "PAUSED", timer stops ticking, button shows "RESUME"
- [ ] Tap another stopwatch while paused — verify nothing happens
- [ ] Tap RESUME — verify labels restore (e.g., "SET 1 / 3"), timer resumes from same elapsed, button shows "PAUSE"
- [ ] Complete all exercises — verify PAUSE button disappears
- [ ] Open Sheets after a paused workout — verify `total_workout_time_s` reflects only active time (not paused duration)
- [ ] Start a new day (change device date or wait) — verify pause state resets cleanly
