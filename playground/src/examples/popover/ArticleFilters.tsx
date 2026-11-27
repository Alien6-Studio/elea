import { useState } from "react";
import { Button, Checkbox, Popover } from "@alien6-studio/elea-ui";

export function ArticleFilters() {
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState({ drafts: true, published: false });

  return (
    <>
      <Popover
        label="Filters"
        open={open}
        onOpenChange={setOpen}
        trigger={(props) => (
          <Button variant="outline" {...props}>
            Filters
          </Button>
        )}
      >
        <Checkbox
          label="Drafts"
          checked={filters.drafts}
          onCheckedChange={(drafts) => setFilters({ ...filters, drafts })}
        />
        <Checkbox
          label="Published"
          checked={filters.published}
          onCheckedChange={(published) => setFilters({ ...filters, published })}
        />
      </Popover>
      <p>The popover is {open ? "open" : "closed"}.</p>
    </>
  );
}
