import { Button } from "@alien6-studio/elea-ui";
import { sitePath } from "../links.js";

/** Shown for an unknown route of the playground and rendered into the site's 404 page. */
export function NotFound() {
  return (
    <section className="site-missing" aria-labelledby="site-missing-title">
      <p className="site-missing__code">404</p>
      <h1 id="site-missing-title" className="site-page-title">Page not found</h1>
      <p className="site-missing__lead">Nothing is published at this address. The page may have moved, or the link may be mistyped.</p>
      <div className="site-missing__actions">
        <Button href={sitePath}>Go to the overview</Button>
        <Button href={`${sitePath}playground/#/ui`} variant="outline">Browse the components</Button>
      </div>
    </section>
  );
}
