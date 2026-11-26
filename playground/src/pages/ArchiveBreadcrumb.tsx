import { useState, type MouseEvent } from "react";
import { Breadcrumb, Button } from "@alien6-studio/elea-ui";

const sections = ["Library", "Periodicals", "Art", "Volume one", "Spring", "Proof"];
const trail = sections.map((label, index) => ({ label, id: String(index), href: "#" + index }));

export function ArchiveBreadcrumb() {
  const [depth, setDepth] = useState(trail.length);
  function navigate(event: MouseEvent<HTMLAnchorElement>, href: string) {
    event.preventDefault();
    setDepth(Number(href.slice(1)) + 1);
  }

  return <div className="catalog-stack">
    <Breadcrumb items={trail.slice(0, depth)} label="Archive location" overflowLabel="Earlier sections"
      maxItems={4} render={({ href, ...link }) => <a {...link} href={href} onClick={event => navigate(event, href)} />} />
    {depth < trail.length && <Button variant="ghost" size="sm" onClick={() => setDepth(trail.length)}>Return to proof</Button>}
  </div>;
}
