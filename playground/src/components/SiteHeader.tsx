import { Button } from "@alien6-studio/elea-ui";
import { repositoryUrl, siteNavigation, type SiteNavigation, type SiteSection } from "../links.js";
import { Logo } from "./Logo.js";
import { SiteProfileSelect, type SiteProfileProps } from "./SiteProfileSelect.js";

export function SiteHeader({ section, navigation = siteNavigation, profile, onProfileChange }: SiteProfileProps & { section?: SiteSection; navigation?: SiteNavigation }) {
  return (
    <>
      <a className="site__skip" href="#main" onClick={(event) => {
        event.preventDefault();
        document.getElementById("main")?.focus();
      }}>Skip to content</a>
      <header className="site__masthead">
        <div className="site-container site__masthead-inner">
          <Logo />
          <nav className="site__nav-links site__masthead-links" aria-label="Main">
            {navigation.map((link) => (
              <a key={link.id} href={link.href} aria-current={section === link.id ? "true" : undefined}>{link.label}</a>
            ))}
          </nav>
          <div className="site__masthead-tools">
            <a className="site__repository" href={repositoryUrl} aria-label="GitHub">
              <span className="site__repository-label">GitHub <span aria-hidden="true">↗</span></span>
              <svg className="site__repository-mark" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M9 19c-4.3 1.3-4.3-2.2-6-2.7m12 5v-3.4c0-1 .1-1.5-.5-2.1 3.1-.4 6.4-1.6 6.4-7a5.4 5.4 0 0 0-1.5-3.8 5 5 0 0 0-.1-3.8s-1.2-.4-3.9 1.5a13.2 13.2 0 0 0-7 0C5.7.8 4.5 1.2 4.5 1.2a5 5 0 0 0-.1 3.8 5.4 5.4 0 0 0-1.5 3.8c0 5.4 3.3 6.6 6.4 7-.5.5-.7 1.1-.7 2.1v3.4" />
              </svg>
            </a>
            <div id="site-profile-picker" hidden={!onProfileChange}><SiteProfileSelect profile={profile} onProfileChange={onProfileChange} /></div>
            <Button variant="ghost" size="sm" className="site__theme-toggle" data-site-theme-toggle="" data-testid="theme-toggle">
              <span className="site__theme-when-light">
                <span className="site__visually-hidden">Switch to the dark theme</span>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
                </svg>
              </span>
              <span className="site__theme-when-dark">
                <span className="site__visually-hidden">Switch to the light theme</span>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.4 1.4m11.2 11.2L19 19M5 19l1.4-1.4M17.6 6.4 19 5" />
                </svg>
              </span>
            </Button>
          </div>
        </div>
      </header>
    </>
  );
}
