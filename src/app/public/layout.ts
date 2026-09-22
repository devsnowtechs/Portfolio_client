import { Component, inject, OnInit } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { Icon, Socials } from "../shared/ui";
import { Content } from "../core/content";
@Component({
  selector: "app-profile-layout",
  standalone: true,
  imports: [RouterOutlet, Icon, Socials],
  template: `<a class="skip-link" href="#main">Skip to content</a>
    <header class="public-header">
      <a class="brand" href="#main"
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
          <a [href]="'#' + l.fragment" (click)="open = false">{{ l.label }}</a>
        }
      </nav>
      <a class="button primary header-cta" [href]="companyUrl + '/contact'"
        >Let's Talk <app-icon name="arrow"
      /></a>
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
        <a href="#about">About me</a>
        <a href="#skills">Skills</a>
      </div>
      <div>
        <h4>Work</h4>
        <a href="#works">Portfolio works</a>
        <a [href]="companyUrl + '/portfolio'">Company portfolio</a>
      </div>
      <div>
        <h4>Contact</h4>
        @if (content.settings()?.publicEmail) {
          <a [href]="'mailto:' + content.settings()!.publicEmail">Email</a>
        }
        @if (whatsApp) {
          <a [href]="whatsApp">WhatsApp</a>
        }
      </div>
      <div class="copyright">
        <span>© {{ year }} {{ displayName }}. Personal profile.</span>
        <a class="admin-signin" [href]="companyUrl"
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
