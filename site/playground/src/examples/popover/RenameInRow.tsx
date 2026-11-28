import { useState } from "react";
import { Button, Field, Input, Popover } from "@alien6-studio/elea-ui";

export function RenameInRow() {
  const [heading, setHeading] = useState("Cranes over the valley");
  const [visits, setVisits] = useState(0);

  return (
    <>
      <div onClick={() => setVisits((count) => count + 1)}>
        <span>{heading}</span>
        <Popover
          label="Rename"
          align="end"
          trigger={(props) => (
            <Button
              variant="outline"
              size="sm"
              {...props}
              onClick={(event) => {
                // The row must not open when its own button is pressed.
                event.stopPropagation();
                props.onClick();
              }}
            >
              Rename
            </Button>
          )}
        >
          {({ close }) => (
            <>
              <Field label="Title">
                {(control) => (
                  <Input
                    {...control}
                    value={heading}
                    onChange={(event) => setHeading(event.target.value)}
                  />
                )}
              </Field>
              <Button size="sm" onClick={close}>
                Done
              </Button>
            </>
          )}
        </Popover>
      </div>
      <p>The row was opened {visits} times.</p>
    </>
  );
}
