import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@alien6-studio/elea-ui";

export function GuideCard() {
  return (
    <Card interactive>
      <CardHeader>
        <CardTitle>
          <a href="/guides/button">Button</a>
        </CardTitle>
        <CardDescription>
          Trigger an action or lead to another page.
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
