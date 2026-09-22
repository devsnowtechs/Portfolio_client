import { bootstrapApplication } from "@angular/platform-browser";
import { provideZoneChangeDetection } from "@angular/core";
import { provideRouter, withInMemoryScrolling } from "@angular/router";
import { App } from "./app/app";
import { routes } from "./app/app.routes";
import { CONFIG, Config } from "./app/core/api";
async function start() {
  const response = await fetch("/config.json", { cache: "no-store" });
  if (!response.ok) throw new Error("Cannot load application configuration.");
  const config: Config = await response.json();
  if (
    typeof config.apiBaseUrl !== "string" ||
    !Number.isFinite(config.toastDurationMs)
  )
    throw new Error("Invalid application configuration.");
  // Local development reaches the API through proxy.conf.json on the same origin, which keeps the
  // SameSite cookies working, so the published API URL from config.json is ignored on localhost.
  const runtime: Config = /^(localhost|127\.0\.0\.1|\[::1\])$/i.test(
    location.hostname,
  )
    ? { ...config, apiBaseUrl: "" }
    : config;
  await bootstrapApplication(App, {
    providers: [
      provideZoneChangeDetection({ eventCoalescing: true }),
      provideRouter(
        routes,
        withInMemoryScrolling({
          scrollPositionRestoration: "enabled",
          anchorScrolling: "enabled",
        }),
      ),
      { provide: CONFIG, useValue: runtime },
    ],
  });
}
start().catch((error) => {
  console.error(error);
  const p = document.createElement("p");
  p.textContent =
    "This profile could not start. Please refresh the page or try again later.";
  p.setAttribute("role", "alert");
  document.querySelector("app-root")?.append(p);
});
