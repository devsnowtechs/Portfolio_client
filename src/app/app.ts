import { Component, inject, OnInit, DestroyRef, effect } from "@angular/core";
import { RouterOutlet, Router, NavigationEnd } from "@angular/router";
import { Title, Meta } from "@angular/platform-browser";
import { filter } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ToastView } from "./shared/ui";
import { Api, CONFIG } from "./core/api";
import { Content } from "./core/content";
@Component({
  selector: "app-root",
  standalone: true,
  imports: [RouterOutlet, ToastView],
  template: `<router-outlet /><app-toasts />`,
})
export class App implements OnInit {
  router = inject(Router);
  api = inject(Api);
  config = inject(CONFIG);
  content = inject(Content);
  destroyRef = inject(DestroyRef);
  title = inject(Title);
  meta = inject(Meta);
  constructor() {
    // The page is the person, so the browser title and the description follow the profile document
    // published from the shared administration dashboard.
    effect(() => {
      const p = this.content.profile();
      const s = this.content.settings();
      if (!p && !s) return;
      const brand = s?.brandName || "Synapse Technologies";
      this.title.setTitle(
        p?.displayName
          ? p.displayName + (p.title ? " | " + p.title : "")
          : "Individual Portfolio | " + brand,
      );
      const description = p?.introduction || s?.seoDescription;
      if (description)
        this.meta.updateTag({ name: "description", content: description });
    });
  }
  ngOnInit() {
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        if (!this.config.analyticsEnabled) return;
        let session = sessionStorage.getItem("portfolio-session-id");
        if (!session) {
          session = crypto.randomUUID();
          sessionStorage.setItem("portfolio-session-id", session);
        }
        // The profile shares the analytics of the company site, so a visit from this host appears in
        // the same dashboard.
        void this.api
          .post(
            "/api/v1/public/analytics",
            {
              eventKey: crypto.randomUUID(),
              sessionId: session,
              type: "visit",
              projectId: null,
              referrer: document.referrer,
            },
            false,
          )
          .catch(() => {});
      });
  }
}
