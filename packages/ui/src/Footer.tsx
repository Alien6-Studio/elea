import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cx } from "./cx.js";

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterGroup {
  /** Visible heading and accessible name of the navigation group. */
  label: string;
  links: readonly FooterLink[];
}

export interface FooterProps extends ComponentPropsWithoutRef<"footer"> {
  brand?: ReactNode;
  groups?: readonly FooterGroup[] | undefined;
  /** Signature, legal links or other content under the main footer. */
  children?: ReactNode;
}

/** A footer landmark with optional branding, link groups and a lower row. */
export function Footer({ brand, groups = [], children, className, ...props }: Readonly<FooterProps>) {
  return (
    <footer {...props} className={cx("elea-footer", className)}>
      {(brand != null || groups.length > 0) && (
        <div className="elea-footer__main">
          {brand != null && <div className="elea-footer__brand">{brand}</div>}
          {groups.length > 0 && (
            <div className="elea-footer__groups">
              {groups.map((group) => (
                <nav key={group.label} aria-label={group.label}>
                  <p className="elea-footer__label">{group.label}</p>
                  <ul>
                    {group.links.map((link) => (
                      <li key={link.href}><a href={link.href}>{link.label}</a></li>
                    ))}
                  </ul>
                </nav>
              ))}
            </div>
          )}
        </div>
      )}
      {children != null && <div className="elea-footer__end">{children}</div>}
    </footer>
  );
}
