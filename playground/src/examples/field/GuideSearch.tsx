import { useState } from "react";
import { SearchAutocomplete } from "@alien6-studio/elea-ui";

type Destination = {
  id: string;
  label: string;
  description: string;
  href: string;
};

const guides: readonly Destination[] = [
  {
    id: "calendar",
    label: "Calendar",
    description: "Forms",
    href: "/guides/calendar",
  },
  {
    id: "card",
    label: "Card",
    description: "Display",
    href: "/guides/card",
  },
  {
    id: "carousel",
    label: "Carousel",
    description: "Navigation",
    href: "/guides/carousel",
  },
];

function statusFor(count: number) {
  if (count === 0) return "No matching guides";
  return count === 1 ? "1 guide" : `${count} guides`;
}

export function GuideSearch({
  destinations = guides,
}: {
  destinations?: readonly Destination[];
}) {
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();
  const results = destinations.filter((item) =>
    item.label.toLowerCase().includes(needle),
  );

  return (
    <SearchAutocomplete
      label="Find a guide"
      placeholder="Calendar, card, carousel"
      clearLabel="Clear query"
      value={query}
      onValueChange={setQuery}
      results={results}
      status={statusFor(results.length)}
      autoSelectFirst
    />
  );
}
