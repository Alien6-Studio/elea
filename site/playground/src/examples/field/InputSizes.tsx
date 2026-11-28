import { Input, Textarea } from "@alien6-studio/elea-ui";

export function InputSizes() {
  return (
    <>
      <Input size="sm" placeholder="Small" aria-label="Small" />
      <Input placeholder="Medium" aria-label="Medium" />
      <Input size="lg" placeholder="Large" aria-label="Large" />
      <Textarea placeholder="A longer text" aria-label="A longer text" />
    </>
  );
}
