import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardImage,
  CardTitle,
} from "@alien6-studio/elea-ui";

export function EditorialCard() {
  return (
    <Card>
      <CardImage
        src="/images/glacier.webp"
        alt="Blue crevasses and white ridges seen from above a glacier"
        width={1050}
        height={525}
      />
      <CardHeader>
        <CardTitle>The glacier notebook</CardTitle>
        <CardDescription>
          Field notes on the shapes that ice leaves behind.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Badge tone="warning">In review</Badge>
      </CardContent>
      <CardFooter>
        <Button href="/notebooks/glacier" size="sm">
          Open notebook
        </Button>
      </CardFooter>
    </Card>
  );
}
