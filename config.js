const CONFIG = {
  days: {
    A: [
      { name: 'Bench Press', sets: 4, reps: 12 },
      { name: 'Incline Dumbbell', sets: 3, reps: 10 },
      { name: 'Cable Fly', sets: 3, reps: 15 },
    ],
    B: [
      { name: 'Squat', sets: 4, reps: 10 },
      { name: 'Leg Press', sets: 3, reps: 12 },
      { name: 'Leg Curl', sets: 3, reps: 12 },
    ],
    C: [
      { name: 'Pull-ups', sets: 4, reps: 8 },
      { name: 'Seated Row', sets: 3, reps: 12 },
      { name: 'Lat Pulldown', sets: 3, reps: 12 },
    ],
    D: [
      { name: 'Overhead Press', sets: 4, reps: 10 },
      { name: 'Lateral Raise', sets: 3, reps: 15 },
      { name: 'Tricep Pushdown', sets: 3, reps: 12 },
    ],
  },
  gyms: [
    { name: 'Gym 1' },
    { name: 'Gym 2' },
  ],
  sheetsWebAppUrl: 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec',
};

if (typeof module !== 'undefined') module.exports = { CONFIG };
