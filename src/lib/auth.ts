import { ApiError, apiRequest, type RequestOptions } from "./api";

const ACCESS_TOKEN_KEY = "findora.access_token";
const REFRESH_TOKEN_KEY = "findora.refresh_token";
const USER_KEY = "findora.user";
export interface RegisterInput { full_name: string; email: string; password: string; }
export interface RegisteredUser { id: string; full_name: string; email: string; phone: string | null; role: string; account_status: string; created_at: string; }
export interface LoginInput { email: string; password: string; }
export interface AuthTokens { access_token: string; refresh_token: string; token_type: string; }
export interface AuthUser { id?: string; full_name?: string; email: string; phone?: string | null; role?: string; }

export function registerUser(input: RegisterInput) { return apiRequest<RegisteredUser>("/auth/register", { method: "POST", body: input }); }
export async function loginUser(input: LoginInput) {
  const tokens = await apiRequest<AuthTokens>("/auth/login", { method: "POST", body: input });
  storeTokens(tokens);
  try {
    await refreshCurrentUser();
  } catch (cause) {
    logoutUser();
    throw cause;
  }
  return tokens;
}
export function storeTokens(tokens: AuthTokens) {
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
}
export function getAccessToken() { return localStorage.getItem(ACCESS_TOKEN_KEY); }
export function clearTokens() { localStorage.removeItem(ACCESS_TOKEN_KEY); localStorage.removeItem(REFRESH_TOKEN_KEY); }

export function storeCurrentUser(user: AuthUser) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getCurrentUser(): AuthUser | null {
  const storedUser = localStorage.getItem(USER_KEY);
  if (!storedUser) return null;
  try {
    return JSON.parse(storedUser) as AuthUser;
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

export function logoutUser() {
  clearTokens();
  localStorage.removeItem(USER_KEY);
}

export async function refreshCurrentUser() {
  const me = await authenticatedRequest<RegisteredUser>("/me");
  storeCurrentUser({ id: me.id, email: me.email, full_name: me.full_name, phone: me.phone, role: me.role });
  return me;
}

let pendingRefresh: Promise<boolean> | null = null;

function refreshTokens() {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refreshToken) return Promise.resolve(false);
  pendingRefresh ??= apiRequest<AuthTokens>("/auth/refresh", { method: "POST", body: { refresh_token: refreshToken } })
    .then((tokens) => { storeTokens(tokens); return true; })
    .catch(() => false)
    .finally(() => { pendingRefresh = null; });
  return pendingRefresh;
}

function endSession() {
  logoutUser();
  window.location.assign("/login");
}

export async function authenticatedRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  try {
    return await apiRequest<T>(path, { ...options, accessToken: getAccessToken() ?? undefined });
  } catch (cause) {
    if (!(cause instanceof ApiError)) throw cause;
    if (cause.statusCode === 401) {
      if (await refreshTokens()) {
        try {
          return await apiRequest<T>(path, { ...options, accessToken: getAccessToken() ?? undefined });
        } catch (retryCause) {
          if (retryCause instanceof ApiError && retryCause.statusCode === 401) endSession();
          throw retryCause;
        }
      }
      endSession();
    }
    if (cause.statusCode === 403 && /suspended/i.test(cause.message)) endSession();
    throw cause;
  }
}
