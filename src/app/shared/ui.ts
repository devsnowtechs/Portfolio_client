import {
  Component,
  Input,
  Output,
  EventEmitter,
  NgZone,
  AfterViewInit,
  OnChanges,
  OnDestroy,
  ViewChild,
  ElementRef,
  inject,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router";
import { Api, Toasts } from "../core/api";
import { Content } from "../core/content";
import { Page, Project } from "../core/models";
@Component({
  selector: "app-icon",
  standalone: true,
  template: `<i [class]="'fa-solid fa-' + resolved" aria-hidden="true"></i>`,
})
export class Icon {
  @Input() name = "code";
  get resolved() {
    return (
      (
        {
          home: "house",
          dashboard: "house",
          projects: "table-cells-large",
          layers: "layer-group",
          timeline: "user",
          skills: "layer-group",
          resume: "file-lines",
          media: "image",
          demo: "video",
          contact: "message",
          custom: "code",
          sales: "chart-column",
          settings: "gear",
          notifications: "bell",
          security: "shield-halved",
          audit: "file-lines",
          analytics: "chart-column",
          download: "download",
          edit: "pen",
          delete: "trash-can",
          close: "xmark",
          check: "circle-check",
          arrow: "arrow-up-right-from-square",
          menu: "bars",
          user: "user",
          cloud: "cloud",
          education: "graduation-cap",
          health: "heart-pulse",
          investment: "chart-line",
          fintech: "building-columns",
          erd: "file-lines",
          insurance: "shield-halved",
          search: "magnifying-glass",
          eye: "eye",
          plus: "plus",
          logout: "right-from-bracket",
          mail: "envelope",
          clock: "clock",
          calendar: "calendar-days",
          upload: "cloud-arrow-up",
          lock: "lock",
          warning: "triangle-exclamation",
        } as Record<string, string>
      )[this.name] || this.name
    );
  }
}
@Component({
  selector: "app-toasts",
  standalone: true,
  imports: [Icon],
  template: `<aside class="toasts" aria-live="polite" aria-atomic="false">
    @for (t of service.items(); track t.id) {
      <section
        class="toast"
        [class.failure]="t.kind === 'error'"
        [attr.role]="t.kind === 'error' ? 'alert' : 'status'"
      >
        <app-icon [name]="t.kind === 'success' ? 'check' : 'warning'" /><span>{{
          t.message
        }}</span
        ><button
          type="button"
          class="icon-button"
          aria-label="Dismiss notification"
          (click)="service.dismiss(t.id)"
        >
          <app-icon name="close" />
        </button>
        <div
          class="toast-timer"
          [style.animation-duration.ms]="t.duration"
        ></div>
      </section>
    }
  </aside>`,
})
export class ToastView {
  service = inject(Toasts);
}
@Component({
  selector: "app-state",
  standalone: true,
  imports: [Icon, CommonModule],
  template: `@if (loading) {
      <div class="state" role="status">
        <span class="spinner"></span> Loading…
      </div>
    }
    @if (error) {
      <div class="error-panel" role="alert">
        <app-icon name="warning" /> {{ error }}
        @if (retryable) {
          <button type="button" class="link" (click)="retry.emit()">
            Try again
          </button>
        }
      </div>
    }
    @for (field of fields | keyvalue; track field.key) {
      <p class="field-error">{{ field.key }}: {{ field.value.join(" ") }}</p>
    }`,
})
export class StateView {
  @Input() loading = false;
  @Input() error = "";
  @Input() fields: Record<string, string[]> = {};
  @Input() retryable = false;
  @Output() retry = new EventEmitter<void>();
}
@Component({
  selector: "app-modal",
  standalone: true,
  imports: [Icon],
  template: `<dialog
    #dialog
    [attr.aria-label]="title"
    (cancel)="cancel($event)"
    (click)="backdrop($event)"
  >
    <div class="modal-shell" [class.wide]="wide">
      <header class="modal-header">
        <div>
          <h2>{{ title }}</h2>
          @if (subtitle) {
            <p>{{ subtitle }}</p>
          }
        </div>
        <button
          type="button"
          class="icon-button"
          aria-label="Close dialog"
          [disabled]="busy"
          (click)="close.emit()"
        >
          <app-icon name="close" />
        </button>
      </header>
      <div class="modal-scroll"><ng-content /></div>
      <footer class="modal-footer">
        <ng-content select="[modal-footer]" />
      </footer>
    </div>
  </dialog>`,
})
export class Modal implements AfterViewInit, OnDestroy {
  @Input() title = "";
  @Input() subtitle = "";
  @Input() wide = false;
  @Input() busy = false;
  @Output() close = new EventEmitter<void>();
  @ViewChild("dialog") element!: ElementRef<HTMLDialogElement>;
  private previous: Element | null = null;
  ngAfterViewInit() {
    this.previous = document.activeElement;
    this.element.nativeElement.showModal();
  }
  ngOnDestroy() {
    this.element.nativeElement.close();
    if (this.previous instanceof HTMLElement) this.previous.focus();
  }
  cancel(e: Event) {
    e.preventDefault();
    if (!this.busy) this.close.emit();
  }
  backdrop(e: MouseEvent) {
    if (e.target === this.element.nativeElement && !this.busy)
      this.close.emit();
  }
}
@Component({
  selector: "app-pagination",
  standalone: true,
  template: `@if (page) {
    <nav class="pagination" aria-label="Pagination">
      <span
        >{{ page.totalCount }} records · Page {{ page.pageNumber }} of
        {{ page.totalPages || 1 }}</span
      ><button
        type="button"
        [disabled]="page.pageNumber <= 1 || busy"
        (click)="change.emit(page.pageNumber - 1)"
      >
        Previous</button
      ><button type="button" class="primary">{{ page.pageNumber }}</button
      ><button
        type="button"
        [disabled]="!page.hasNextPage || busy"
        (click)="change.emit(page.pageNumber + 1)"
      >
        Next
      </button>
    </nav>
  }`,
})
export class Pagination {
  @Input() page: Page<unknown> | null = null;
  @Input() busy = false;
  @Output() change = new EventEmitter<number>();
}
@Component({
  selector: "app-socials",
  standalone: true,
  imports: [CommonModule],
  template: `<div class="socials">
    @for (s of content.settings()?.socialLinks | keyvalue; track s.key) {
      @if (s.value) {
        <a
          [href]="s.value"
          target="_blank"
          rel="noopener noreferrer"
          [class]="s.key"
          [attr.aria-label]="s.key"
          ><i [class]="'fa-brands fa-' + s.key" aria-hidden="true"></i
        ></a>
      }
    }
  </div>`,
})
export class Socials {
  content = inject(Content);
}
@Component({
  selector: "app-gallery",
  standalone: true,
  imports: [Icon],
  template: `<div class="gallery">
    <div class="main-image">
      @if (project.images.length) {
        <img
          [src]="
            api.asset(
              project.images[index]?.media.url || project.images[0].media.url
            )
          "
          [alt]="project.images[index]?.media.alt || project.title"
          loading="lazy"
        /><button
          class="autoplay"
          type="button"
          (click)="toggle()"
          [attr.aria-label]="
            pinned ? 'Resume automatic slideshow' : 'Pause automatic slideshow'
          "
        >
          <i [class]="pinned ? 'fa-solid fa-play' : 'fa-solid fa-pause'"></i>
          {{
            pinned ? "Pinned" : "Auto · " + project.galleryIntervalSeconds + "s"
          }}
        </button>
      } @else {
        <div class="image-empty">
          <app-icon name="media" /><span>No project images</span>
        </div>
      }
    </div>
    <div class="thumbnails">
      @for (img of project.images; track img.media.id; let i = $index) {
        @if (!img.isCover) {
          <button
            type="button"
            [class.selected]="index === i"
            (click)="select(i)"
            [attr.aria-label]="'Show ' + img.media.alt"
            [attr.aria-pressed]="index === i"
          >
            <img
              [src]="api.asset(img.media.thumbnailUrl || img.media.url)"
              [alt]="img.media.alt"
              loading="lazy"
            />
          </button>
        }
      }
    </div>
  </div>`,
})
export class Gallery implements OnChanges, OnDestroy {
  @Input({ required: true }) project!: Project;
  api = inject(Api);
  index = 0;
  pinned = false;
  private timer?: ReturnType<typeof setInterval>;
  ngOnChanges() {
    this.index = 0;
    this.pinned = false;
    clearInterval(this.timer);
    this.timer = setInterval(
      () => {
        if (
          !this.pinned &&
          !document.hidden &&
          this.project.images.length > 1
        ) {
          this.index = (this.index + 1) % this.project.images.length;
          if (this.project.images[this.index]?.isCover)
            this.index = (this.index + 1) % this.project.images.length;
        }
      },
      Math.max(1, this.project.galleryIntervalSeconds || 5) * 1000,
    );
  }
  select(i: number) {
    this.index = i;
    this.pinned = true;
  }
  toggle() {
    this.pinned = !this.pinned;
  }
  ngOnDestroy() {
    clearInterval(this.timer);
  }
}
@Component({
  selector: "app-project-card",
  standalone: true,
  imports: [Gallery, Icon, RouterLink],
  template: `<article class="project-card" [class.compact]="compact">
    <app-gallery [project]="project" />
    <div class="project-copy">
      <span class="eyebrow">{{ content.category(project.categoryId) }}</span>
      <h3>
        <button class="heading-link" (click)="details.emit(project)">
          {{ project.title }}
        </button>
      </h3>
      <p>{{ project.brief }}</p>
      <ul class="features">
        @for (f of highlights; track $index) {
          <li><app-icon name="check" />{{ f.text }}</li>
        }
      </ul>
      <div class="capsules">
        @for (t of project.technologies; track t.id) {
          <span [style.--capsule-color]="t.color">{{ t.name }}</span>
        }
      </div>
      <p class="sales">
        <app-icon name="sales" /> Sales: {{ project.salesCount }}
      </p>
    </div>
    <div class="card-actions">
      @if (project.liveUrl) {
        <a
          class="button"
          [href]="project.liveUrl"
          target="_blank"
          rel="noopener noreferrer"
          >View Live <app-icon name="arrow"
        /></a>
      }
      @if (project.allowDemo) {
        <a
          class="button"
          routerLink="/contact"
          [queryParams]="{ mode: 'Demo', project: project.id }"
          >Request Demo</a
        >
      }
      @if (project.allowBuy && project.buyUrl) {
        <a
          class="button primary"
          [href]="project.buyUrl"
          target="_blank"
          rel="noopener noreferrer"
          ><i class="fa-brands fa-whatsapp"></i> Buy</a
        >
      }
      <button type="button" class="link" (click)="details.emit(project)">
        More <app-icon name="plus" />
      </button>
    </div>
  </article>`,
})
export class ProjectCard {
  @Input({ required: true }) project!: Project;
  @Input() compact = false;
  @Output() details = new EventEmitter<Project>();
  content = inject(Content);
  get highlights() {
    return this.project.features.filter((f) => f.highlight).slice(0, 3);
  }
}
@Component({
  selector: "app-project-detail",
  standalone: true,
  imports: [Modal, Gallery, Icon, RouterLink],
  template: `<app-modal
    [title]="project.title"
    [subtitle]="project.brief"
    [wide]="true"
    (close)="close.emit()"
    ><div class="detail-grid">
      <div>
        <app-gallery [project]="project" />
        <div class="panel tint">
          <h3>Project overview</h3>
          <p>{{ content.category(project.categoryId) }}</p>
          <p>
            {{ project.images.length }} images ·
            {{ project.features.length }} features
          </p>
          @if (project.sourceUrl) {
            <a
              [href]="project.sourceUrl"
              target="_blank"
              rel="noopener noreferrer"
              >View source <app-icon name="arrow"
            /></a>
          }
        </div>
      </div>
      <div>
        <h3>About this project</h3>
        <div class="rich-text" [innerHTML]="project.descriptionHtml"></div>
        <h3>Technology stack</h3>
        <div class="capsules">
          @for (t of project.technologies; track t.id) {
            <span [style.--capsule-color]="t.color">{{ t.name }}</span>
          }
        </div>
        <h3>Full features</h3>
        @for (group of groups; track group) {
          <h4>{{ group }}</h4>
          <ul class="features">
            @for (f of project.features; track $index) {
              @if (f.group === group) {
                <li><app-icon name="check" />{{ f.text }}</li>
              }
            }
          </ul>
        }
      </div>
    </div>
    <div modal-footer class="actions spread">
      <span>Sales: {{ project.salesCount }}</span>
      <div class="actions">
        @if (project.liveUrl) {
          <a
            class="button"
            [href]="project.liveUrl"
            target="_blank"
            rel="noopener noreferrer"
            >View Live <app-icon name="arrow"
          /></a>
        }
        @if (project.allowDemo) {
          <a
            class="button"
            routerLink="/contact"
            [queryParams]="{ mode: 'Demo', project: project.id }"
            (click)="close.emit()"
            >Request Demo</a
          >
        }
        @if (project.buyUrl) {
          <a
            class="button primary"
            [href]="project.buyUrl"
            target="_blank"
            rel="noopener noreferrer"
            >Buy via WhatsApp</a
          >
        }
      </div>
    </div></app-modal
  >`,
})
export class ProjectDetail {
  @Input({ required: true }) project!: Project;
  @Output() close = new EventEmitter<void>();
  content = inject(Content);
  get groups() {
    return [...new Set(this.project.features.map((f) => f.group))];
  }
}
