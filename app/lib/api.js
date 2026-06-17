const BASE_URL = 'https://memelli-bar-control.up.railway.app';
const AUTH_TOKEN = 'Bearer 1604';

async function apiFetch(endpoint, method = 'POST', body = null) {
  const options = {
    method,
    headers: {
      'Authorization': AUTH_TOKEN,
      'Content-Type': 'application/json'
    }
  };
  if (body) options.body = JSON.stringify(body);

  const response = await fetch(`${BASE_URL}${endpoint}`, options);
  if (!response.ok) {
    throw new Error(`API Error ${response.status}: ${response.statusText}`);
  }
  return response.json();
}

export const api = {
  // GrogBath -> live swarm telemetry
  getLiveData: () => apiFetch('/api/live_data', 'POST'),
  // MellieDock -> brain v15. Endpoint consumes `text` (verified on the wire); `message` is ignored.
  sendChat: (message) => apiFetch('/api/mellie/chat', 'POST', { text: message }),
  // Signup -> cross-schema mutation (user + customer + wallet)
  submitSignup: (formData) => apiFetch('/api/auth/signup', 'POST', formData)
};
