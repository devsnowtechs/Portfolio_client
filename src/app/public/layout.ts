import { Component, inject, OnInit } from "@angular/core";
import { RouterLink, RouterOutlet } from "@angular/router";
import { Icon, Socials } from "../shared/ui";
import { Content } from "../core/content";
@Component({
  selector: "app-profile-layout",
  standalone: true,
  imports: [RouterLink, RouterOutlet, Icon, Socials],
  template: `<a class="skip-link" href="#main">Skip to content</a>
    <header class="public-header">
      <div class="container header-inner">
        <a class="brand" routerLink="/"
          ><app-icon name="user" />{{ displayName }}.</a
        ><button
          class="mobile-toggle icon-button"
          (click)="open = !open"
          [attr.aria-expanded]="open"
          aria-label="Toggle navigation"
        >
          <app-icon name="menu" />
        </button>
        <nav [class.open]="open">
          @for (l of links; track l.fragment) {
            <a
              [routerLink]="['/']"
              [fragment]="l.fragment"
              (click)="section(l.fragment)"
              >{{ l.label }}</a
            >
          }
        </nav>
        <a
          class="button primary header-cta"
          [href]="companyUrl + '/contact'"
          target="_blank"
          rel="noopener noreferrer"
          >Let's Talk <app-icon name="arrow"
        /></a>
      </div>
    </header>
    <main id="main"><router-outlet /></main>
    <footer class="public-footer">
      <div>
        <span class="brand"><app-icon name="user" />{{ displayName }}.</span>
        <p>{{ content.profile()?.title }}</p>
        <app-socials />
      </div>
      <div>
        <h4>Profile</h4>
        <a [routerLink]="['/']" [fragment]="'about'" (click)="section('about')"
          >About me</a
        >
        <a
          [routerLink]="['/']"
          [fragment]="'skills'"
          (click)="section('skills')"
          >Skills</a
        >
      </div>
      <div>
        <h4>Work</h4>
        <a [routerLink]="['/']" [fragment]="'works'" (click)="section('works')"
          >Portfolio works</a
        >
        <a
          [href]="companyUrl + '/portfolio'"
          target="_blank"
          rel="noopener noreferrer"
          >Company portfolio</a
        >
      </div>
      <div>
        <h4>Contact</h4>
        @if (content.settings()?.publicEmail) {
          <a [href]="'mailto:' + content.settings()!.publicEmail">Email</a>
        }
        @if (whatsApp) {
          <a [href]="whatsApp" target="_blank" rel="noopener noreferrer"
            >WhatsApp</a
          >
        }
      </div>
      <div class="copyright">
        <span>© {{ year }} {{ displayName }}. Personal profile.</span>
        <a
          class="admin-signin"
          [href]="companyUrl"
          target="_blank"
          rel="noopener noreferrer"
          >{{ companyName }} <app-icon name="arrow"
        /></a>
      </div>
    </footer>`,
})
export class ProfileLayout implements OnInit {
  content = inject(Content);
  open = false;
  year = new Date().getFullYear();
  // The personal profile lives on its own host and links back to the company site for enquiries,
  // the full portfolio and the administration workspace.
  companyUrl = "https://synapsetechs.org";
  links = [
    { fragment: "about", label: "About" },
    { fragment: "education", label: "Education" },
    { fragment: "skills", label: "Skills" },
    { fragment: "works", label: "Works" },
    { fragment: "contact", label: "Contact" },
  ];
  // The router scrolls to the fragment once, but the sections are published from the API and may not
  // be in the document yet (Education and Skills only render once entries exist), which is why the
  // top-bar links appeared to do nothing. The jump is retried briefly until the anchor exists.
  section(fragment: string) {
    this.open = false;
    let attempts = 0;
    const jump = () => {
      const target = document.getElementById(fragment);
      if (target) target.scrollIntoView({ block: "start" });
      else if (attempts++ < 20) setTimeout(jump, 100);
    };
    setTimeout(jump, 0);
  }
  get displayName() {
    return this.content.profile()?.displayName || "My Profile";
  }
  get companyName() {
    return this.content.settings()?.brandName || "Synapse Technologies";
  }
  get whatsApp() {
    const digits = (this.content.settings()?.whatsAppNumber || "").replace(
      /\D/g,
      "",
    );
    return digits ? "https://wa.me/" + digits : "";
  }
  ngOnInit() {
    void this.content.load();
  }
}
