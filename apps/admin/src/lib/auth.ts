import { clearToken, isAuthenticated, normalizeStoredToken, setToken, api } from "./api";

normalizeStoredToken();

export { isAuthenticated };

export async function login(username: string, password: string) {
  const result = await api.login(username, password);
  setToken(result.token);
  return result;
}

export function logout() {
  clearToken();
}

export function getDevCredentials() {
  return {
    username: "admin",
    password: "admin123",
  };
}
