import { Footer } from "@alien6-studio/elea-ui";
import { alien6Url, repositoryUrl, siteNavigation, sitePath, type SiteNavigation } from "../links.js";
import { Logo } from "./Logo.js";

const project = {
  label: "Project",
  links: [
    { label: "Source on GitHub", href: repositoryUrl },
    { label: "Apache 2.0 license", href: `${repositoryUrl}/blob/main/LICENSE` },
  ],
};

export function SiteFooter({ navigation = siteNavigation }: { navigation?: SiteNavigation }) {
  return (
    <Footer role="contentinfo" className="site-footer" groups={[{ label: "Explore Elea", links: navigation }, project]} brand={
      <>
        <Logo />
        <p>Open-source React components for products built around rich content.</p>
      </>
    }>
      <a className="site-footer__signature" href={alien6Url}>
        <span>Built by</span>
        <img src={`${sitePath}assets/alien6.png`} width={92} height={41} alt="Alien6" loading="lazy" />
      </a>
    </Footer>
  );
}
