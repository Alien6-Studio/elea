import { Badge } from "@alien6-studio/elea-ui";

export function BadgeTones() {
  return (
    <>
      <Badge>Neutral</Badge>
      <Badge tone="primary">Primary</Badge>
      <Badge tone="secondary">Secondary</Badge>
      <Badge tone="success" variant="solid">
        Published
      </Badge>
      <Badge tone="info">Scheduled</Badge>
      <Badge tone="warning" variant="outline">
        Pending
      </Badge>
      <Badge tone="danger" size="sm">
        3
      </Badge>
    </>
  );
}
