// src/utils/api.js
const BASE = import.meta.env.VITE_API_URL || ''

export const debugApi = (body) =>
  fetch(`${BASE}/api/debug`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })

export const followupApi = (body) =>
  fetch(`${BASE}/api/followup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })