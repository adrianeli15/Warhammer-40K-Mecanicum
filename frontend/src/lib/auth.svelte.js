function loadStored() {
  if (typeof localStorage === "undefined") return { token: null, user: null };
  try {
    return {
      token: localStorage.getItem("nox_token"),
      user: JSON.parse(localStorage.getItem("nox_user") || "null"),
    };
  } catch {
    return { token: null, user: null };
  }
}

const stored = loadStored();

export const auth = $state({
  token: stored.token,
  user: stored.user,
});

export function setSession(token, user) {
  auth.token = token;
  auth.user = user;
  localStorage.setItem("nox_token", token);
  localStorage.setItem("nox_user", JSON.stringify(user));
}

export function clearSession() {
  auth.token = null;
  auth.user = null;
  localStorage.removeItem("nox_token");
  localStorage.removeItem("nox_user");
}

export function isAdmin() {
  return auth.user?.roles?.name === "admin";
}

export function canRead() {
  return ["admin", "supervisor"].includes(auth.user?.roles?.name);
}
