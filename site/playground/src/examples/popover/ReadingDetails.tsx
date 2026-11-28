import { Button, Popover } from "@alien6-studio/elea-ui";

export function ReadingDetails() {
  return (
    <>
      <Popover
        label="Reading time"
        trigger={(props) => (
          <Button variant="outline" size="sm" {...props}>
            Bottom start
          </Button>
        )}
      >
        About six minutes.
      </Popover>
      <Popover
        label="Word count"
        align="center"
        trigger={(props) => (
          <Button variant="outline" size="sm" {...props}>
            Bottom centre
          </Button>
        )}
      >
        1,240 words.
      </Popover>
      <Popover
        label="Last revision"
        side="top"
        align="end"
        trigger={(props) => (
          <Button variant="outline" size="sm" {...props}>
            Top end
          </Button>
        )}
      >
        Saved on Monday.
      </Popover>
    </>
  );
}
