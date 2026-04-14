function formatDate(d) {
  return d.toISOString().slice(0, 10);
}

function buildExerciseRow(exercise, gymName, weightData, restDurationsMs, date) {
  const restS = restDurationsMs.map(ms => Math.round(ms / 1000));
  const avgRest = restS.length
    ? Math.round(restS.reduce((a, b) => a + b, 0) / restS.length)
    : 0;
  const maxRest = restS.length ? Math.max(...restS) : 0;

  return {
    date: formatDate(date),
    day: exercise.day,
    exercise: exercise.name,
    sets: exercise.sets,
    reps: exercise.reps,
    gym: gymName,
    weight_raw: weightData.value,
    weight_type: weightData.type,
    rest_durations: restS,
    avg_rest_s: avgRest,
    max_rest_s: maxRest,
  };
}

function buildSessionSummary(day, gymName, workoutStartTime, exerciseNames, now) {
  return {
    date: formatDate(now),
    day,
    gym: gymName,
    total_workout_time_s: Math.round((now.getTime() - workoutStartTime) / 1000),
    exercises_completed: exerciseNames.length,
  };
}

function buildSkippedRow(date) {
  return { date: formatDate(date) };
}

if (typeof module !== 'undefined') {
  module.exports = { buildExerciseRow, buildSessionSummary, buildSkippedRow, formatDate };
}
