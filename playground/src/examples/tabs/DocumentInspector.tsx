import { Tabs } from "@alien6-studio/elea-ui";

const tabs = [
  {
    value: "details",
    label: "Details",
    panel: <p>Review the article title, author and publication date.</p>,
  },
  {
    value: "revisions",
    label: "Revisions",
    panel: <p>Two revisions are available for this article.</p>,
  },
  { value: "analytics", label: "Analytics", panel: null, disabled: true },
];

export function DocumentInspector() {
  return (
    <Tabs label="Article information" defaultValue="details" items={tabs} />
  );
}
