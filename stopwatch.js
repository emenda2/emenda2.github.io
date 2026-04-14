function createStopwatchState(totalSets) {
  return {
    phase: 'idle',
    currentSet: 0,
    totalSets,
    startTime: null,
    phaseDurations: [],
  };
}

function tapStopwatch(state, now) {
  if (state.phase === 'done') return state;

  if (state.phase === 'idle') {
    return { ...state, phase: 'exercise', currentSet: 1, startTime: now };
  }

  const elapsed = now - state.startTime;
  const durations = [...state.phaseDurations, elapsed];

  if (state.phase === 'exercise') {
    if (state.currentSet === state.totalSets) {
      return { ...state, phase: 'done', phaseDurations: durations, startTime: null };
    }
    return { ...state, phase: 'rest', startTime: now, phaseDurations: durations };
  }

  if (state.phase === 'rest') {
    return {
      ...state,
      phase: 'exercise',
      currentSet: state.currentSet + 1,
      startTime: now,
      phaseDurations: durations,
    };
  }

  return state;
}

function getRestDurations(state) {
  return state.phaseDurations.filter((_, i) => i % 2 === 1);
}

function getExerciseDurations(state) {
  return state.phaseDurations.filter((_, i) => i % 2 === 0);
}

if (typeof module !== 'undefined') {
  module.exports = { createStopwatchState, tapStopwatch, getRestDurations, getExerciseDurations };
}
