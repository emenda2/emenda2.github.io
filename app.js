if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(console.error);
}

// ── Screen Wake Lock ────────────────────────────────
// Primary: looping embedded MP4 (iOS-compatible active-media trick)
// Bonus: Wake Lock API where supported (Android Chrome, iOS 16.4+)
let _noSleepVideo = null;
let _noSleepError = null;

// Tiny 1×1 H.264 MP4 loop — iOS treats real video as active media and keeps screen on
const _NOSLEEP_MP4 = 'data:video/mp4;base64,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';

let _noSleepBlobUrl = null;
function _getNoSleepBlobUrl() {
  if (_noSleepBlobUrl) return _noSleepBlobUrl;
  const b64 = _NOSLEEP_MP4.split(',')[1];
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  _noSleepBlobUrl = URL.createObjectURL(new Blob([bytes], {type: 'video/mp4'}));
  return _noSleepBlobUrl;
}

function startNoSleep() {
  if (_noSleepVideo) return;
  const video = document.createElement('video');
  video.src = _getNoSleepBlobUrl();
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.style.cssText = 'position:fixed;width:1px;height:1px;opacity:0;pointer-events:none';
  document.body.appendChild(video);
  _noSleepVideo = video;
  video.play()
    .then(() => updateBuildStamp())
    .catch(err => { _noSleepError = err.name; _noSleepVideo = null; video.remove(); updateBuildStamp(); });
}

function stopNoSleep() {
  if (!_noSleepVideo) return;
  _noSleepVideo.pause();
  _noSleepVideo.src = '';
  _noSleepVideo.remove();
  _noSleepVideo = null;
}

let wakeLock = null;
async function requestWakeLock() {
  if (!('wakeLock' in navigator)) return;
  if (document.visibilityState !== 'visible') return;
  try {
    wakeLock = await navigator.wakeLock.request('screen');
    updateBuildStamp();
    wakeLock.addEventListener('release', () => { wakeLock = null; updateBuildStamp(); requestWakeLock(); });
  } catch (_) {}
}
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') requestWakeLock();
});
requestWakeLock();

function updateBuildStamp() {
  const el = document.getElementById('build-stamp');
  if (!el) return;
  const wlStatus = !('wakeLock' in navigator) ? 'WL:no' : (wakeLock ? 'WL:held' : 'WL:lost');
  const cs = 'captureStream' in document.createElement('canvas') ? 'CS:✓' : 'CS:✗';
  const vp = _noSleepVideo && !_noSleepVideo.paused ? 'VP:✓' : (_noSleepError ? `VP:${_noSleepError}` : 'VP:—');
  el.textContent = `v5 | ${wlStatus} | ${cs} | ${vp}`;
}
document.addEventListener('DOMContentLoaded', updateBuildStamp);

// ── App State ──────────────────────────────────────
const state = {
  activeDay: 'A',
  activeGymIndex: 0,
  workoutStartTime: null,
  lastResetDate: null,
  cardStates: {},
  isPaused: false,
  pauseStartTime: null,
  totalPausedMs: 0,
  hasSynced: false,
};

// ── Init ───────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderTabs();
  renderCards();
  bindGymToggle();
  checkSkippedDays();
  retrySyncQueue();
  document.getElementById('finish-early-btn').addEventListener('click', () => {
    if (confirm('Log completed exercises and finish workout?')) triggerSync();
  });
  document.getElementById('pause-btn').addEventListener('click', () => {
    if (state.isPaused) resumeWorkout();
    else pauseWorkout();
  });
});

// ── Tabs ───────────────────────────────────────────
function renderTabs() {
  const nav = document.getElementById('day-tabs');
  nav.innerHTML = '';
  Object.keys(CONFIG.days).forEach(day => {
    const btn = document.createElement('button');
    btn.className = 'day-tab';
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', day === state.activeDay ? 'true' : 'false');
    btn.textContent = day;
    btn.addEventListener('click', () => {
      state.activeDay = day;
      renderTabs();
      renderCards();
    });
    nav.appendChild(btn);
  });
}

// ── Gym Toggle ─────────────────────────────────────
function bindGymToggle() {
  const btn = document.getElementById('gym-toggle');
  updateGymToggleUI(btn);
  btn.addEventListener('click', () => {
    state.activeGymIndex = (state.activeGymIndex + 1) % CONFIG.gyms.length;
    updateGymToggleUI(btn);
    renderCards();
  });
}

function updateGymToggleUI(btn) {
  btn.textContent = CONFIG.gyms[state.activeGymIndex].name.toUpperCase();
}

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

function pauseWorkout() {
  state.isPaused = true;
  state.pauseStartTime = Date.now();

  clearInterval(_tickInterval);
  _tickInterval = null;

  // Cancel wall-clock beep timeouts — they'll be rescheduled on resume
  for (const name of _pendingBeepTimeouts.keys()) cancelRestBeeps(name);

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

  Object.entries(state.cardStates).forEach(([name, swState]) => {
    if (swState.phase !== 'idle' && swState.phase !== 'done' && swState.startTime !== null) {
      swState.startTime += pauseDuration;
    }
    // Reschedule beeps for any exercise still in rest after the shift
    if (swState.phase === 'rest') {
      scheduleRestBeeps(name, swState.startTime);
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

// ── Cards ──────────────────────────────────────────
function renderCards() {
  // Auto-clear any active pause when re-rendering cards (tab/gym switch),
  // so newly rendered cards are immediately interactive.
  if (state.isPaused) resumeWorkout();

  const container = document.getElementById('card-container');
  container.innerHTML = '';

  // Reset card states for this day if it's a new calendar day
  const todayStr = formatDate(new Date());
  if (state.lastResetDate !== todayStr) {
    state.cardStates = {};
    state.workoutStartTime = null;
    state.lastResetDate = todayStr;
    state.isPaused = false;
    state.pauseStartTime = null;
    state.totalPausedMs = 0;
    state.hasSynced = false;
  }

  const exercises = CONFIG.days[state.activeDay];
  exercises.forEach(exercise => {
    if (!state.cardStates[exercise.name]) {
      state.cardStates[exercise.name] = createStopwatchState(exercise.sets);
    }
    const card = buildCard(exercise, state.cardStates[exercise.name]);
    container.appendChild(card);
  });

  updateFinishEarlyButton();
  updatePauseButton();
}

function buildCard(exercise, swState) {
  const gymIndex = state.activeGymIndex;
  const weightData = getWeight(exercise.name, gymIndex);

  const card = document.createElement('div');
  card.className = 'exercise-card' + (swState.phase === 'done' ? ' done' : '');
  card.dataset.exercise = exercise.name;

  card.innerHTML = `
    <div class="card-title">${exercise.name}</div>
    <div class="card-meta">${exercise.sets} sets · ${exercise.reps} reps</div>

    <div class="weight-row">
      <input
        class="weight-input"
        type="number"
        inputmode="decimal"
        min="0"
        step="0.5"
        value="${weightData.value}"
        placeholder="—"
        aria-label="Weight for ${exercise.name}"
      >
      <button class="type-toggle ${weightData.type === 'kg' ? 'active' : ''}" data-type="kg">KG</button>
      <button class="type-toggle ${weightData.type === 'plates' ? 'active' : ''}" data-type="plates">PLATES</button>
    </div>

    <div class="plate-weight-row ${weightData.type === 'plates' ? '' : 'hidden'}">
      <span>kg / plate:</span>
      <input
        class="plate-weight-input"
        type="number"
        inputmode="decimal"
        min="0"
        step="0.5"
        value="${weightData.plateWeight || ''}"
        placeholder="—"
        aria-label="kg per plate for ${exercise.name}"
      >
    </div>

    <div class="stopwatch" role="button" aria-label="Stopwatch for ${exercise.name}">
      <div class="stopwatch-time ${swState.phase}">--:--</div>
      <div class="stopwatch-label">${swLabelText(swState)}</div>
    </div>
  `;

  // Weight value input
  const weightInput = card.querySelector('.weight-input');
  weightInput.addEventListener('change', () => {
    const current = getWeight(exercise.name, gymIndex);
    setWeight(exercise.name, gymIndex, { ...current, value: parseFloat(weightInput.value) || '' });
  });

  // Type toggles (KG / PLATES)
  card.querySelectorAll('.type-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const newType = btn.dataset.type;
      const current = getWeight(exercise.name, gymIndex);
      setWeight(exercise.name, gymIndex, { ...current, type: newType });
      card.querySelectorAll('.type-toggle').forEach(b => b.classList.toggle('active', b.dataset.type === newType));
      card.querySelector('.plate-weight-row').classList.toggle('hidden', newType !== 'plates');
    });
  });

  // Plate weight input
  const plateInput = card.querySelector('.plate-weight-input');
  plateInput.addEventListener('change', () => {
    const current = getWeight(exercise.name, gymIndex);
    setWeight(exercise.name, gymIndex, { ...current, plateWeight: parseFloat(plateInput.value) || '' });
  });

  // Stopwatch tap
  const sw = card.querySelector('.stopwatch');
  sw.addEventListener('click', () => onStopwatchTap(exercise, card));

  return card;
}

function swLabelText(swState) {
  if (swState.phase === 'idle') return 'TAP TO START';
  if (swState.phase === 'exercise') return `SET ${swState.currentSet} / ${swState.totalSets}`;
  if (swState.phase === 'rest') return 'REST';
  if (swState.phase === 'done') return 'DONE ✓';
  return '';
}

// ── Finish Early Button ────────────────────────────
function updateFinishEarlyButton() {
  const btn = document.getElementById('finish-early-btn');
  const exercises = CONFIG.days[state.activeDay];
  const anyStarted = exercises.some(ex => {
    const s = state.cardStates[ex.name];
    return s && s.phase !== 'idle';
  });
  const allDone = exercises.every(ex => {
    const s = state.cardStates[ex.name];
    return s && s.phase === 'done';
  });
  btn.classList.toggle('hidden', !anyStarted || allDone);
}

// ── Stopwatch Tick ─────────────────────────────────
let _tickInterval = null;

function startTickLoop() {
  if (_tickInterval) return;
  _tickInterval = setInterval(tickAllStopwatches, 100);
}

function tickAllStopwatches() {
  const now = Date.now();
  const cards = document.querySelectorAll('.exercise-card');
  let anyActive = false;

  cards.forEach(card => {
    const name = card.dataset.exercise;
    const swState = state.cardStates[name];
    if (!swState || swState.phase === 'idle' || swState.phase === 'done') return;

    anyActive = true;
    const elapsed = now - swState.startTime;
    const timeEl = card.querySelector('.stopwatch-time');
    timeEl.textContent = formatMs(elapsed);
  });

  if (!anyActive) {
    clearInterval(_tickInterval);
    _tickInterval = null;
  }
}

function formatMs(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const s = (totalSeconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// ── Stopwatch Tap ──────────────────────────────────
function onStopwatchTap(exercise, card) {
  const prev = state.cardStates[exercise.name];
  if (prev.phase === 'done') return;
  if (state.isPaused) return;

  const now = Date.now();

  if (!state.workoutStartTime) {
    state.workoutStartTime = now;
    startNoSleep();
  }

  const next = tapStopwatch(prev, now);
  state.cardStates[exercise.name] = next;

  const timeEl = card.querySelector('.stopwatch-time');
  const labelEl = card.querySelector('.stopwatch-label');

  timeEl.className = `stopwatch-time ${next.phase}`;
  timeEl.textContent = next.phase === 'done'
    ? formatMs(next.phaseDurations.reduce((a, b) => a + b, 0))
    : '00:00';
  labelEl.textContent = swLabelText(next);

  if (next.phase === 'done') {
    card.classList.add('done');
  }

  if (prev.phase === 'rest') {
    cancelRestBeeps(exercise.name);
  }

  if (next.phase === 'rest') {
    scheduleRestBeeps(exercise.name, next.startTime);
  }

  startTickLoop();
  updateFinishEarlyButton();
  updatePauseButton();
  checkWorkoutComplete();
}

// ── Audio ──────────────────────────────────────────
let _audioCtx = null;
// exerciseName → [timeoutId, ...]  (wall-clock scheduled, not audio-time)
const _pendingBeepTimeouts = new Map();

function getAudioCtx() {
  if (!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return _audioCtx;
}

function playBeep(frequency) {
  try {
    const ctx = getAudioCtx();
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.value = frequency;
    const t = ctx.currentTime;
    gain.gain.setValueAtTime(0.0, t);
    gain.gain.linearRampToValueAtTime(0.4, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    osc.start(t);
    osc.stop(t + 0.3);
  } catch (e) {
    console.warn('Audio not available:', e);
  }
}

// restStartTime: Date.now() value at the moment rest began
function scheduleRestBeeps(exerciseName, restStartTime) {
  cancelRestBeeps(exerciseName);
  const ids = [45, 46, 47, 48, 49, 50].map(sec => {
    const delay = (restStartTime + sec * 1000) - Date.now();
    if (delay <= 0) return null;
    return setTimeout(() => playBeep(sec === 50 ? 1100 : 880), delay);
  }).filter(id => id !== null);
  _pendingBeepTimeouts.set(exerciseName, ids);
}

function cancelRestBeeps(exerciseName) {
  const ids = _pendingBeepTimeouts.get(exerciseName);
  if (ids) ids.forEach(clearTimeout);
  _pendingBeepTimeouts.delete(exerciseName);
}

// ── Workout Completion ─────────────────────────────
function checkWorkoutComplete() {
  const exercises = CONFIG.days[state.activeDay];
  const allDone = exercises.every(ex => {
    const s = state.cardStates[ex.name];
    return s && s.phase === 'done';
  });
  if (allDone) triggerSync();
}

async function triggerSync() {
  if (!state.workoutStartTime) return;
  if (state.hasSynced) return;
  state.hasSynced = true;
  const exercises = CONFIG.days[state.activeDay];
  const gymName = CONFIG.gyms[state.activeGymIndex].name;
  const now = new Date();

  const completedExercises = exercises.filter(ex => {
    const s = state.cardStates[ex.name];
    return s && s.phase === 'done';
  });

  const exerciseRows = completedExercises.map(ex => {
    const swState = state.cardStates[ex.name];
    const weightData = getWeight(ex.name, state.activeGymIndex);
    const restMs = getRestDurations(swState);
    return buildExerciseRow({ ...ex, day: state.activeDay }, gymName, weightData, restMs, now);
  });

  const sessionRow = buildSessionSummary(
    state.activeDay,
    gymName,
    state.workoutStartTime + state.totalPausedMs,
    completedExercises.map(ex => ex.name),
    now
  );

  setLastSession({ date: sessionRow.date, day: state.activeDay });

  const payload = { exerciseRows, sessionRow };

  stopNoSleep();

  try {
    await syncExercises(CONFIG.sheetsWebAppUrl, exerciseRows);
    await syncSession(CONFIG.sheetsWebAppUrl, sessionRow);
    showSyncStatus('Synced to Sheets ✓');
  } catch (e) {
    addToSyncQueue(payload);
    showSyncStatus('Offline — will sync later');
  }
}

function showSyncStatus(msg) {
  const el = document.createElement('div');
  el.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:var(--surface);color:var(--green);padding:8px 16px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;z-index:100;border:1px solid var(--border);';
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

// ── Offline Retry ──────────────────────────────────
async function retrySyncQueue() {
  const queue = getSyncQueue();
  if (!queue.length) return;
  if (!navigator.onLine) return;

  try {
    for (const payload of queue) {
      await syncExercises(CONFIG.sheetsWebAppUrl, payload.exerciseRows);
      await syncSession(CONFIG.sheetsWebAppUrl, payload.sessionRow);
    }
    clearSyncQueue();
    showSyncStatus('Queued workouts synced ✓');
  } catch (e) {
    // Still offline or error — leave queue intact
  }
}

// ── Skipped Day Detection ──────────────────────────
async function checkSkippedDays() {
  const last = getLastSession();
  if (!last) return;

  const lastDate = new Date(last.date + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffDays = Math.round((today - lastDate) / 86400000);
  if (diffDays <= 1) return;

  for (let i = 1; i < diffDays; i++) {
    const skippedDate = new Date(lastDate);
    skippedDate.setDate(skippedDate.getDate() + i);
    const row = buildSkippedRow(skippedDate);
    try {
      await syncSkipped(CONFIG.sheetsWebAppUrl, row);
    } catch (e) {
      // Best-effort — don't queue skipped days
    }
  }
}
