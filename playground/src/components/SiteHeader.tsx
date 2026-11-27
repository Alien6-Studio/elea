import { Button, Navbar } from "@alien6-studio/elea-ui";
import { siteNavigation, type SiteNavigation, type SiteSection } from "../links.js";
import { SiteSearch } from "./SiteSearch.js";
import { RepositoryLink } from "./RepositoryLink.js";
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
          <div id="site-search"><SiteSearch /></div>
          <RepositoryLink />
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
          <Navbar className="site__masthead-links" label="Main" menuLabel="Site menu" collapse="never"
            items={navigation} current={section}
            render={props => <a {...props} aria-current={props["aria-current"] ? "true" : undefined} />} />
        </div>
      </header>
    </>
  );
}
