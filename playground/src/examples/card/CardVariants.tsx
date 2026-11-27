import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@alien6-studio/elea-ui";

export function CardVariants() {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Outline</CardTitle>
          <CardDescription>A border on the page surface.</CardDescription>
        </CardHeader>
      </Card>
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Elevated</CardTitle>
          <CardDescription>A shadow lifts it off the page.</CardDescription>
        </CardHeader>
      </Card>
      <Card variant="subtle">
        <CardHeader>
          <CardTitle>Subtle</CardTitle>
          <CardDescription>A quiet fill, without a border.</CardDescription>
        </CardHeader>
      </Card>
    </>
  );
}
