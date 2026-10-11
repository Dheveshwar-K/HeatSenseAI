/**
 * API Service Client
 * Connects to FastAPI backend endpoints including The Weather Company (TWC)
 * and Personal Weather Station (PWS) real-time feeds.
 */

const API_BASE = 'http://127.0.0.1:8000';

export async function fetchSystemStatus() {
  const res = await fetch(`${API_BASE}/api/status`);
  if (!res.ok) throw new Error('Failed to fetch status');
  return res.json();
}

export async function fetchCurrentTelemetry() {
  const res = await fetch(`${API_BASE}/api/current`);
  if (!res.ok) throw new Error('Failed to fetch current telemetry');
  return res.json();
}

export async function fetchTWCWeatherCurrent(lat = 11.0168, lng = 76.9558, forceRefresh = false) {
  const res = await fetch(`${API_BASE}/api/weather/current?latitude=${lat}&longitude=${lng}&force_refresh=${forceRefresh}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail?.message || err.message || 'Failed to fetch current weather from TWC');
  }
  return res.json();
}

export async function fetchPWSWeather(stationId, lat = null, lng = null, forceRefresh = false) {
  let url = `${API_BASE}/api/weather/pws/${stationId}?force_refresh=${forceRefresh}`;
  if (lat !== null && lng !== null) {
    url += `&latitude=${lat}&longitude=${lng}`;
  }
  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail?.message || err.message || `Failed to fetch PWS station ${stationId}`);
  }
  return res.json();
}

export async function fetchNearestPWS(lat = 11.0168, lng = 76.9558) {
  const res = await fetch(`${API_BASE}/api/weather/pws/nearest?latitude=${lat}&longitude=${lng}`);
  if (!res.ok) throw new Error('Failed to discover nearest PWS stations');
  return res.json();
}

export async function fetchWeatherHistory(limit = 30) {
  const res = await fetch(`${API_BASE}/api/weather/history?limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch weather history');
  return res.json();
}

export async function fetchWeatherDebug(lat = 11.0168, lng = 76.9558) {
  const res = await fetch(`${API_BASE}/api/weather/debug?latitude=${lat}&longitude=${lng}`);
  if (!res.ok) throw new Error('Failed to fetch weather debug diagnostics');
  return res.json();
}

export async function calculateThermalStress(payload) {
  const res = await fetch(`${API_BASE}/api/thermal-stress/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Thermal stress calculation failed');
  return res.json();
}

export async function predictRisk(payload) {
  const res = await fetch(`${API_BASE}/api/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Prediction request failed');
  return res.json();
}

export async function fetchModelInfo() {
  const res = await fetch(`${API_BASE}/api/model-info`);
  if (!res.ok) throw new Error('Failed to fetch model info');
  return res.json();
}

export async function fetchFeatureImportance() {
  const res = await fetch(`${API_BASE}/api/feature-importance`);
  if (!res.ok) throw new Error('Failed to fetch feature importance');
  return res.json();
}

export async function fetchAlerts() {
  const res = await fetch(`${API_BASE}/api/alerts`);
  if (!res.ok) throw new Error('Failed to fetch alerts');
  return res.json();
}

export async function fetchEmergencyStatus() {
  const res = await fetch(`${API_BASE}/api/emergency/status`);
  if (!res.ok) throw new Error('Failed to fetch emergency status');
  return res.json();
}

export async function triggerManualEmergencyCall(payload = {}) {
  const res = await fetch(`${API_BASE}/api/emergency/call`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Manual emergency call request failed');
  return res.json();
}

export async function acknowledgeAlarm() {
  const res = await fetch(`${API_BASE}/api/emergency/acknowledge`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to acknowledge alarm');
  return res.json();
}

export async function resolveEmergency() {
  const res = await fetch(`${API_BASE}/api/emergency/resolve`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to resolve emergency');
  return res.json();
}
