// Plain storage helpers (no React Context). Every page that needs the admin
// session reads/writes it directly through these functions.
const STORAGE_KEY = "worketyamo_admin_session";

export function getSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setSession(session) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Storage might be unavailable (private mode, quota) — fail silently,
    // the page-level auth check will simply redirect to /admin/login.
  }
}

export function clearSession() {
  localStorage.removeItem(STORAGE_KEY);
}
