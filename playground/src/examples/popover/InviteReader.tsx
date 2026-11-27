import { useState } from "react";
import { Button, Field, Input, Popover } from "@alien6-studio/elea-ui";

export function InviteReader() {
  const [email, setEmail] = useState("");
  const [invited, setInvited] = useState("nobody yet");

  return (
    <>
      <Popover
        label="Invite a reader"
        trigger={(props) => (
          <Button variant="outline" {...props}>
            Invite
          </Button>
        )}
      >
        {({ close }) => (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setInvited(email);
              setEmail("");
              close();
            }}
          >
            <Field label="Email">
              {(control) => (
                <Input
                  {...control}
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              )}
            </Field>
            <Button variant="ghost" size="sm" onClick={close}>
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Send
            </Button>
          </form>
        )}
      </Popover>
      <p>Last invitation: {invited}</p>
    </>
  );
}
