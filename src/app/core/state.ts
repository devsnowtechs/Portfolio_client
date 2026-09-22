import { Directive, inject, signal } from "@angular/core";
import { Api, ApiError } from "./api";
@Directive()
export abstract class PageState {
  api = inject(Api);
  busy = signal(false);
  error = signal("");
  fields = signal<Record<string, string[]>>({});
  async run(action: () => Promise<void>) {
    if (this.busy()) return;
    this.busy.set(true);
    this.error.set("");
    this.fields.set({});
    try {
      await action();
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : "Something went wrong.");
      if (e instanceof ApiError) this.fields.set(e.fields);
      else this.api.toasts.show(this.error(), "error");
    } finally {
      this.busy.set(false);
    }
  }
}
