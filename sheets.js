async function _post(url, payload) {
  // Google Apps Script doesn't handle CORS preflight (OPTIONS).
  // text/plain is a "simple" content type — no preflight needed.
  // no-cors means the response is opaque but the data reaches the server.
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify(payload),
    mode: 'no-cors',
  });
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
