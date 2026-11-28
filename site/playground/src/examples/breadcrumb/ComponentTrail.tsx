import { Breadcrumb } from "@alien6-studio/elea-ui";

const trail = [
  { id: "components", label: "Components", href: "/components" },
  { id: "breadcrumb", label: "Breadcrumb" },
];

export function ComponentTrail() {
  return (
    <Breadcrumb
      label="Component location"
      overflowLabel="Earlier pages"
      separator="›"
      items={trail}
    />
  );
}
