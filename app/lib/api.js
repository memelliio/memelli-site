const BASE_URL = 'https://memelli-bar-control.up.railway.app';

async function apiFetch(endpoint, method = 'POST', body = null) {
  const options = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) options.body = JSON.stringify(body);
  const response = await fetch(`${BASE_URL}${endpoint}`, options);
  if (!response.ok) throw new Error(`API Error ${response.status}: ${response.statusText}`);
  return response.json();
}

export const api = {
  // GrogBath -> live swarm telemetry (public, no key)
  getLiveData: () => apiFetch('/api/live_data', 'POST', {}),
  // MellieDock -> brain v15; endpoint consumes `text` (verified)
  sendChat: (message) => apiFetch('/api/mellie/chat', 'POST', { text: message }),
  // Signup -> user + customer + wallet mutation
  submitSignup: (formData) => apiFetch('/api/auth/signup', 'POST', formData)
};
