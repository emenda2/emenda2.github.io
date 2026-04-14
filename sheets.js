async function _post(url, payload) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Sheets sync failed: ${res.status}`);
  return res.json();
}

async function syncExercises(url, rows) {
  return _post(url, { type: 'exercise', rows });
}

async function syncSession(url, sessionRow) {
  return _post(url, { type: 'session', ...sessionRow });
}

async function syncSkipped(url, skippedRow) {
  return _post(url, { type: 'skipped', ...skippedRow });
}

if (typeof module !== 'undefined') {
  module.exports = { syncExercises, syncSession, syncSkipped };
}
