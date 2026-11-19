import { useEffect, useState } from "react";
import { IconButton } from "@alien6-studio/elea-ui";
import { href, useHashRoute } from "./router.js";
import { Logo } from "./components/Logo.js";
import { HomePage } from "./pages/Home.js";
import { PlaygroundPage } from "./pages/Playground.js";
import { GettingStartedPage } from "./pages/GettingStarted.js";
import { ColorPage, SpacingPage, ThemingPage, TypographyPage } from "./pages/foundations.js";
import { BlocksPage, InterchangePage, WritingPage } from "./pages/content.js";
import { AccessibilityPage } from "./pages/Accessibility.js";
import { CropperPage, DropZonePage } from "./pages/media.js";
import { ButtonsPage, BadgePage, FieldsPage, ChoicesPage, DialogPage, MenuPage, TooltipPage, PaginationPage, SelectPage, UiOverviewPage } from "./pages/ui.js";

interface Page {
  route: string;
  title: string;
  render: () => React.JSX.Element;
  wide?: boolean;
  /** The page takes the whole column, edge to edge. */
  full?: boolean;
}

export const GROUPS: { title: string; pages: Page[] }[] = [
  { title: "Start", pages: [{ route: "home", title: "Overview", render: HomePage, wide: true }, { route: "getting-started", title: "Getting started", render: GettingStartedPage }, { route: "playground", title: "Playground", render: PlaygroundPage, full: true }, { route: "accessibility", title: "Accessibility", render: AccessibilityPage }] },
  { title: "Foundations", pages: [{ route: "color", title: "Color", render: ColorPage }, { route: "typography", title: "Typography", render: TypographyPage }, { route: "spacing", title: "Spacing, radius, elevation", render: SpacingPage }, { route: "theming", title: "Theming", render: ThemingPage }] },
  { title: "Content", pages: [{ route: "writing", title: "Writing", render: WritingPage, wide: true }, { route: "blocks", title: "Blocks", render: BlocksPage, wide: true }, { route: "interchange", title: "Markdown and HTML", render: InterchangePage }] },
  {
    title: "Components",
    pages: [
      { route: "ui", title: "Overview", render: UiOverviewPage },
      { route: "ui/button", title: "Button", render: ButtonsPage },
      { route: "ui/badge", title: "Badge", render: BadgePage },
      { route: "ui/field", title: "Field, Input, Textarea", render: FieldsPage },
      { route: "ui/select", title: "Select", render: SelectPage },
      { route: "ui/choice", title: "Checkbox and Toggle", render: ChoicesPage },
      { route: "ui/dialog", title: "Dialog", render: DialogPage },
      { route: "ui/menu", title: "Menu", render: MenuPage },
      { route: "ui/tooltip", title: "Tooltip", render: TooltipPage },
      { route: "ui/pagination", title: "Pagination", render: PaginationPage },
    ],
  },
  { title: "Media", pages: [{ route: "media/dropzone", title: "Drop zone", render: DropZonePage }, { route: "media/cropper", title: "Image cropper", render: CropperPage }] },
];

const SunIcon = () => <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>;
const MoonIcon = () => <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>;

export function App() {
  const route = useHashRoute();
  const [theme, setTheme] = useState<"light" | "dark">(() => (globalThis.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);
  const page = GROUPS.flatMap((group) => group.pages).find((candidate) => candidate.route === route) ?? (GROUPS[0]?.pages[0] as Page);
  return (
    <div className="site">
      <nav className="site__nav" aria-label="Documentation">
        <a className="site__brand" href={href("home")}>
          <Logo />
          <span>Elea</span>
        </a>
        {GROUPS.map((group) => (
          <div key={group.title}>
            <div className="site__group">{group.title}</div>
            <ul>
              {group.pages.map((candidate) => (
                <li key={candidate.route}>
                  <a href={href(candidate.route)} aria-current={candidate.route === page.route ? "page" : undefined}>{candidate.title}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
      <div className={`site__main${page.full ? " site__main--full" : ""}`}>
        <div className="site__bar">
          <a href="https://github.com/Alien6-Studio/elea">GitHub</a>
          <a href="https://www.npmjs.com/org/alien6-studio">npm</a>
          <IconButton size="sm" variant="ghost" label={theme === "light" ? "Switch to the dark theme" : "Switch to the light theme"} onClick={() => setTheme(theme === "light" ? "dark" : "light")} data-testid="theme-toggle">
            {theme === "light" ? <MoonIcon /> : <SunIcon />}
          </IconButton>
        </div>
        <main className={`site__content${page.wide ? " site__content--wide" : ""}${page.full ? " site__content--full" : ""}`}>
          <page.render />
        </main>
      </div>
    </div>
  );
}
