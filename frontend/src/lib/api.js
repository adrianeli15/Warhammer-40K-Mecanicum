const BASE = "";

async function request(path, { method = "GET", body, token } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.success === false) {
    throw new Error(json.error || `Error ${res.status}`);
  }
  return json.data;
}

export const api = {
  login: (email, password) => request("/api/auth/login", { method: "POST", body: { email, password } }),
  me: (token) => request("/api/auth/me", { token }),
  users: (token) => request("/api/users", { token }),
  createUser: (token, payload) => request("/api/users", { method: "POST", token, body: payload }),
  updateUser: (token, id, payload) => request(`/api/users/${id}`, { method: "PUT", token, body: payload }),
  changePassword: (token, id, password) =>
    request(`/api/users/${id}/password`, { method: "PATCH", token, body: { password } }),
  deleteUser: (token, id) => request(`/api/users/${id}`, { method: "DELETE", token }),
  roles: (token) => request("/api/roles", { token }),
  createRole: (token, payload) => request("/api/roles", { method: "POST", token, body: payload }),
  updateRole: (token, id, payload) => request(`/api/roles/${id}`, { method: "PUT", token, body: payload }),
  deleteRole: (token, id) => request(`/api/roles/${id}`, { method: "DELETE", token }),
  auditLogs: (token) => request("/api/audit-logs", { token }),
};
