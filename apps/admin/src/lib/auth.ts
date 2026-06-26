import { clearToken, isAuthenticated, api } from "./api";
import { setAdminSession, toAdminSession } from "./session";

export { isAuthenticated };

export async function login(username: string, password: string) {
  const result = await api.login(username, password);
  return result;
}

export async function hydrateSession() {
  if (!isAuthenticated()) return null;
  try {
    const me = await api.fetchMe();
    setAdminSession(toAdminSession(me));
    return me;
  } catch {
    return null;
  }
}

export async function logout() {
  try {
    await api.logoutAdmin();
  } catch {
    // ignore offline logout failures
  }
  clearToken();
}

export function getDevCredentials() {
  return {
    username: "admin",
    password: "admin123",
  };
}
