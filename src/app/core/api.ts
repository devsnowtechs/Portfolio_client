import { Injectable, InjectionToken, inject, signal } from "@angular/core";
import { ApiResponse, User, Login } from "./models";
export interface Config {
  apiBaseUrl: string;
  toastDurationMs: number;
  analyticsEnabled: boolean;
}
export const CONFIG = new InjectionToken<Config>("runtime config");
export interface Toast {
  id: number;
  kind: "success" | "error";
  message: string;
  duration: number;
}
@Injectable({ providedIn: "root" })
export class Toasts {
  private config = inject(CONFIG);
  items = signal<Toast[]>([]);
  private count = 0;
  show(message: string, kind: "success" | "error" = "success") {
    const id = ++this.count;
    const duration = this.config.toastDurationMs;
    this.items.update((v) => [...v.slice(-3), { id, kind, message, duration }]);
    setTimeout(() => this.dismiss(id), duration);
  }
  dismiss(id: number) {
    this.items.update((v) => v.filter((x) => x.id !== id));
  }
}
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public fields: Record<string, string[]> = {},
    public code = "",
  ) {
    super(message);
    // Failures without field details arrive as "errors": null, and a default parameter only
    // covers undefined. Keep the collection iterable for every consumer of ApiError.
    if (!this.fields) this.fields = {};
  }
}
@Injectable({ providedIn: "root" })
export class Api {
  config = inject(CONFIG);
  toasts = inject(Toasts);
  sessionExpired = signal(false);
  private csrf?: string;
  private csrfPending?: Promise<string>;
  url(path: string) {
    return this.config.apiBaseUrl.replace(/\/$/, "") + path;
  }
  media(id: string | null) {
    return id ? this.url("/api/v1/media/" + id + "/content") : "";
  }
  asset(path: string) {
    return path.startsWith("/api/") ? this.url(path) : path;
  }
  resetCsrf() {
    this.csrf = undefined;
    this.csrfPending = undefined;
  }
  async token(): Promise<string> {
    if (this.csrf) return this.csrf;
    if (this.csrfPending) return this.csrfPending;
    this.csrfPending = (async () => {
      const r = await fetch(this.url("/api/v1/auth/csrf"), {
        credentials: "include",
      });
      if (!r.ok)
        throw new ApiError(
          r.status,
          "Unable to prepare a secure request. Please try again.",
        );
      const b: ApiResponse<{ token: string }> = await r.json();
      this.csrf = b.data.token;
      return this.csrf;
    })();
    try {
      return await this.csrfPending;
    } finally {
      this.csrfPending = undefined;
    }
  }
  async request<T>(
    method: string,
    path: string,
    body?: unknown,
    query: Record<string, unknown> = {},
    notify = true,
  ): Promise<T> {
    try {
      const u = new URL(this.url(path), location.origin);
      for (const [k, v] of Object.entries(query))
        if (v !== "" && v !== null && v !== undefined)
          u.searchParams.set(k, String(v));
      const headers: Record<string, string> = { Accept: "application/json" };
      if (method !== "GET") {
        headers["X-XSRF-TOKEN"] = await this.token();
        if (!(body instanceof FormData))
          headers["Content-Type"] = "application/json";
      }
      const response = await fetch(u, {
        method,
        headers,
        credentials: "include",
        body:
          body === undefined
            ? undefined
            : body instanceof FormData
              ? body
              : JSON.stringify(body),
      });
      const data: ApiResponse<T> = await response
        .json()
        .catch(() => ({
          message: "The server returned an unexpected response.",
        }));
      if (!response.ok || !data.success)
        throw new ApiError(
          response.status,
          data.message || "Request failed.",
          data.errors ?? {},
          data.errorCode ?? "",
        );
      if (method !== "GET" && notify)
        this.toasts.show(data.message || "Changes saved.");
      return data.data;
    } catch (e) {
      const error =
        e instanceof ApiError
          ? e
          : new ApiError(
              0,
              "Cannot connect to the portfolio service. Please try again.",
            );
      if (error.status === 401 && !path.startsWith("/api/v1/auth/"))
        this.sessionExpired.set(true);
      if (notify) this.toasts.show(error.message, "error");
      throw error;
    }
  }
  async all<T>(p: string, q: Record<string, unknown> = {}) {
    const items: T[] = [];
    let n = 1;
    let page: { items: T[]; hasNextPage: boolean };
    do {
      page = await this.get(p, { ...q, pageNumber: n++, pageSize: 100 });
      items.push(...page.items);
    } while (page.hasNextPage);
    return items;
  }
  get<T>(p: string, q: Record<string, unknown> = {}, notify = true) {
    return this.request<T>("GET", p, undefined, q, notify);
  }
  post<T>(p: string, b: unknown = {}, notify = true) {
    return this.request<T>("POST", p, b, {}, notify);
  }
  put<T>(p: string, b: unknown) {
    return this.request<T>("PUT", p, b);
  }
  delete<T>(p: string, version?: string) {
    return this.request<T>("DELETE", p, version ? { version } : {});
  }
  async download(
    path: string,
    name = "download",
    query: Record<string, unknown> = {},
  ) {
    try {
      const u = new URL(this.url(path), location.origin);
      for (const [k, v] of Object.entries(query))
        if (v) u.searchParams.set(k, String(v));
      const r = await fetch(u, { credentials: "include" });
      if (!r.ok) {
        const b = await r.json().catch(() => ({}));
        throw new Error(b.message || "Download failed.");
      }
      const blob = await r.blob();
      const href = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = href;
      a.download = name;
      a.click();
      setTimeout(() => URL.revokeObjectURL(href), 1000);
    } catch (e) {
      this.toasts.show(
        e instanceof Error ? e.message : "Download failed.",
        "error",
      );
    }
  }
}
@Injectable({ providedIn: "root" })
export class Auth {
  api = inject(Api);
  user = signal<User | null>(null);
  private checked = false;
  async restore() {
    if (this.checked) return this.user();
    try {
      this.user.set(await this.api.get<User>("/api/v1/auth/me", {}, false));
      this.checked = true;
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        this.checked = true;
        this.user.set(null);
      } else throw e;
    }
    return this.user();
  }
  async login(email: string, password: string, rememberMe: boolean) {
    const r = await this.api.post<Login>(
      "/api/v1/auth/login",
      { email, password, rememberMe },
      false,
    );
    if (r.user) {
      this.user.set(r.user);
      this.checked = true;
      this.api.resetCsrf();
      this.api.sessionExpired.set(false);
    }
    return r;
  }
  async verify(challenge: string, code: string, recoveryCode: boolean) {
    const r = await this.api.post<Login>(
      "/api/v1/auth/verify-mfa",
      { challenge, code, recoveryCode },
      false,
    );
    this.user.set(r.user);
    this.checked = true;
    this.api.resetCsrf();
    this.api.sessionExpired.set(false);
  }
  async refresh() {
    this.checked = false;
    return this.restore();
  }
  async logout() {
    await this.api.post("/api/v1/auth/logout");
    this.clear();
  }
  clear() {
    this.user.set(null);
    this.checked = true;
    this.api.resetCsrf();
    this.api.sessionExpired.set(false);
  }
}
