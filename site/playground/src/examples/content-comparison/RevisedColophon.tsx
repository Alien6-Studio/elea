import { ContentComparison } from "@alien6-studio/elea-content-viewer";
import { Card } from "@alien6-studio/elea-ui";
import "@alien6-studio/elea-content-viewer/styles.css";

const first = {
  blocks: [
    { type: "header", data: { text: "Colophon", level: 3 } },
    {
      type: "paragraph",
      data: {
        text: "Set in <em>Garamond</em> and printed in Lyon on"
          + ' <a href="/papers/munken">Munken paper</a>.',
      },
    },
    { type: "paragraph", data: { text: "First printing: 800 copies." } },
  ],
};

const second = {
  blocks: [
    { type: "header", data: { text: "Colophon", level: 3 } },
    {
      type: "paragraph",
      data: {
        text: "Set in <em>Garamond</em> and <strong>bound</strong> in Lyon"
          + ' on <a href="/papers/munken">Munken paper</a>.',
      },
    },
    {
      type: "list",
      data: {
        style: "ordered",
        items: ["First printing: 800 copies", "Second printing: 1,200"],
      },
    },
  ],
};

export function RevisedColophon() {
  return (
    <Card padding="lg">
      <ContentComparison before={first} after={second} />
    </Card>
  );
}
