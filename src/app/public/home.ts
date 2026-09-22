import { Component, inject, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Content } from "../core/content";
import { PageState } from "../core/state";
import { Project, Page } from "../core/models";
import {
  Icon,
  Socials,
  StateView,
  ProjectCard,
  ProjectDetail,
} from "../shared/ui";
@Component({
  selector: "app-profile-home",
  standalone: true,
  imports: [CommonModule, Icon, Socials, StateView, ProjectCard, ProjectDetail],
  template: `<section class="container section profile">
    <app-state
      [loading]="busy()"
      [error]="error() || content.error()"
      [retryable]="true"
      (retry)="load()"
    />
    <div class="profile-hero" id="about">
      <div>
        <div class="portrait">
          @if (content.profile()?.portraitMediaId) {
            <img
              [src]="api.media(content.profile()!.portraitMediaId)"
              [alt]="content.profile()?.displayName || 'Portrait'"
            />
          } @else {
            <app-icon name="user" />
          }
        </div>
        <app-socials />
      </div>
      <div>
        <span class="eyebrow pill">PERSONAL PROFILE</span>
        <h1>{{ content.profile()?.displayName || "My Profile" }}</h1>
        <p class="lead">
          {{
            content.profile()?.title ||
              "Software and AI engineer at Synapse Technologies"
          }}
        </p>
        <p>{{ content.profile()?.introduction }}</p>
        <div class="actions profile-actions">
          @if (whatsApp) {
            <a
              class="button primary"
              [href]="whatsApp"
              target="_blank"
              rel="noopener noreferrer"
              ><i class="fa-brands fa-whatsapp" aria-hidden="true"></i>
              WhatsApp {{ whatsAppLabel }}</a
            >
          }
          @if (content.settings()?.publicEmail) {
            <a class="button" [href]="'mailto:' + content.settings()!.publicEmail"
              ><app-icon name="mail" /> Email me</a
            >
          }
          @if (content.profile()?.showResumeButton !== false) {
            <button
              (click)="api.download('/api/v1/resume/download', 'Resume.pdf')"
            >
              <app-icon name="download" /> Download Résumé
            </button>
          }
        </div>
      </div>
    </div>
    @if (content.profile()?.biographyHtml) {
      <section class="profile-section">
        <h2>About me<span>.</span></h2>
        <div
          class="rich-text"
          [innerHTML]="content.profile()!.biographyHtml"
        ></div>
      </section>
    }
    @if (education.length) {
      <section class="profile-section" id="education">
        <h2>Education<span>.</span></h2>
        <div class="record-list">
          @for (t of education; track t.id) {
            <article>
              <div class="milestone"><app-icon [name]="t.icon" /></div>
              <div>
                <h3>{{ t.title }}</h3>
                @if (t.organisation) {
                  <strong>{{ t.organisation }}</strong>
                }
                @if (t.startDate) {
                  <small
                    >{{ t.startDate | date: "MMM yyyy" }} –
                    {{
                      t.endDate ? (t.endDate | date: "MMM yyyy") : "Present"
                    }}</small
                  >
                }
                @if (t.description) {
                  <p>{{ t.description }}</p>
                }
              </div>
            </article>
          }
        </div>
      </section>
    }
    @if (skillGroups.length) {
      <section class="profile-section" id="skills">
        <h2>Skills<span>.</span></h2>
        <div class="skill-groups">
          @for (g of skillGroups; track g.name) {
            <div>
              <h4>{{ g.name }}</h4>
              <div class="chips">
                @for (s of g.items; track s.id) {
                  <span class="chip"
                    ><app-icon [name]="s.icon" /> {{ s.name }}</span
                  >
                }
              </div>
            </div>
          }
        </div>
      </section>
    }
    @if (experience.length) {
      <section class="profile-section" id="experience">
        <h2>Experience<span>.</span></h2>
        <div class="record-list">
          @for (t of experience; track t.id) {
            <article>
              <div class="milestone"><app-icon [name]="t.icon" /></div>
              <div>
                <h3>{{ t.title }}</h3>
                @if (t.organisation) {
                  <strong>{{ t.organisation }}</strong>
                }
                @if (t.startDate) {
                  <small
                    >{{ t.startDate | date: "MMM yyyy" }} –
                    {{
                      t.endDate ? (t.endDate | date: "MMM yyyy") : "Present"
                    }}</small
                  >
                }
                @if (t.description) {
                  <p>{{ t.description }}</p>
                }
              </div>
            </article>
          }
        </div>
      </section>
    }
    <section class="profile-section" id="works">
      <div class="section-heading">
        <div>
          <h2>Portfolio works<span>.</span></h2>
          <p>Platforms, applications and AI features I have delivered.</p>
        </div>
      </div>
      <div class="works-grid">
        @for (p of projects(); track p.id) {
          <app-project-card [project]="p" (details)="selected = $event" />
        }
      </div>
      @if (!busy() && !projects().length) {
        <p class="empty">Projects will appear here when published.</p>
      }
      <p class="muted">
        More published work is listed on the
        <a [href]="companyUrl + '/portfolio'">company portfolio</a>.
      </p>
    </section>
    <section class="profile-section" id="contact">
      <h2>Reach out<span>.</span></h2>
      <p>
        Share the project, the timeline and your constraints. I reply personally
        and usually within one working day.
      </p>
      <div class="contact-cards-grid">
        @if (whatsApp) {
          <a
            class="contact-card"
            [href]="whatsApp"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i class="fa-brands fa-whatsapp" aria-hidden="true"></i>
            <strong>WhatsApp</strong>
            <span>{{ whatsAppLabel }}</span>
          </a>
        }
        @if (content.settings()?.publicEmail) {
          <a
            class="contact-card"
            [href]="'mailto:' + content.settings()!.publicEmail"
          >
            <app-icon name="mail" />
            <strong>Email</strong>
            <span>{{ content.settings()!.publicEmail }}</span>
          </a>
        }
        <a class="contact-card" [href]="companyUrl + '/contact'">
          <app-icon name="contact" />
          <strong>Synapse Technologies</strong>
          <span>Book a demo or request a custom solution</span>
        </a>
      </div>
    </section>
  </section>
  @if (selected) {
    <app-project-detail [project]="selected" (close)="selected = null" />
  }`,
})
export class ProfileHome extends PageState implements OnInit {
  content = inject(Content);
  companyUrl = "https://synapsetechs.org";
  projects = signal<Project[]>([]);
  selected: Project | null = null;
  // Everything on this page is published from the shared administration dashboard: the profile
  // document, the timeline, the skills catalogue, the projects and the public contact details.
  get education() {
    return this.content.timeline().filter((t) => t.category === "Education");
  }
  get experience() {
    return this.content
      .timeline()
      .filter((t) => t.category !== "Education" && t.category !== "Interests");
  }
  get skillGroups() {
    return this.content
      .group("SkillGroup")
      .map((g) => ({
        name: g.name,
        items: this.content.skills().filter((s) => s.groupId === g.id),
      }))
      .filter((g) => g.items.length > 0);
  }
  get whatsApp() {
    const digits = this.digits();
    return digits ? "https://wa.me/" + digits : "";
  }
  get whatsAppLabel() {
    const digits = this.digits();
    if (!digits) return "";
    if (digits.length <= 10) return "+" + digits;
    const tail = digits.slice(-10);
    return (
      "+" +
      digits.slice(0, -10) +
      " " +
      tail.slice(0, 3) +
      " " +
      tail.slice(3, 6) +
      " " +
      tail.slice(6)
    );
  }
  private digits() {
    return (this.content.settings()?.whatsAppNumber || "").replace(/\D/g, "");
  }
  ngOnInit() {
    this.load();
  }
  load() {
    void this.content.load(true);
    void this.run(async () =>
      this.projects.set(
        (
          await this.api.get<Page<Project>>("/api/v1/public/projects", {
            pageNumber: 1,
            pageSize: 12,
            sort: "order",
          })
        ).items,
      ),
    );
  }
}
