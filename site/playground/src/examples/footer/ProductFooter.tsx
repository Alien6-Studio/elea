import { Footer } from "@alien6-studio/elea-ui";

const groups = [
  {
    label: "Resources",
    links: [{ label: "Documentation", href: "/docs/getting-started/" }],
  },
];

export function ProductFooter() {
  return (
    <Footer brand={<strong>Field notes</strong>} groups={groups}>
      Editorial workspace
    </Footer>
  );
}
