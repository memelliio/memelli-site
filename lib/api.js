// lib/api.js — the one API helper. Normal fetch against /api/* (proxied to the rail
// by next.config in dev; same-origin in prod). credentials:'include' carries mio_sess.
export const api = (path, opts = {}) =>
  fetch(path, { credentials: 'include', ...opts })
    .then((r) => r.json())
    .catch(() => ({}));

export const apiGet = (path) => api(path);

export const apiPost = (path, body) =>
  api(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {}),
  });
