import { Injectable, inject, signal } from "@angular/core";
import { Api } from "./api";
import { Profile, Settings, Catalogue, Skill, Timeline } from "./models";
@Injectable({ providedIn: "root" })
export class Content {
  api = inject(Api);
  profile = signal<Profile | null>(null);
  settings = signal<Settings | null>(null);
  catalogue = signal<Catalogue[]>([]);
  skills = signal<Skill[]>([]);
  timeline = signal<Timeline[]>([]);
  error = signal("");
  private pending?: Promise<void>;
  load(force = false) {
    if (this.pending && !force) return this.pending;
    this.pending = (async () => {
      this.error.set("");
      try {
        const [p, s, c, k, t] = await Promise.all([
          this.api.get<Profile>("/api/v1/public/profile", {}, false),
          this.api.get<Settings>("/api/v1/public/settings", {}, false),
          this.api.get<Catalogue[]>("/api/v1/public/catalogue", {}, false),
          this.api.get<Skill[]>("/api/v1/public/skills", {}, false),
          this.api.get<Timeline[]>("/api/v1/public/timeline", {}, false),
        ]);
        this.profile.set(p);
        this.settings.set(s);
        this.catalogue.set(c);
        this.skills.set(k);
        this.timeline.set(t);
      } catch {
        this.error.set("Portfolio content is temporarily unavailable.");
        this.pending = undefined;
      }
    })();
    return this.pending;
  }
  category(id: string) {
    return this.catalogue().find((c) => c.id === id)?.name || "";
  }
  group(kind: string) {
    return this.catalogue().filter((c) => c.kind === kind && c.active);
  }
}
