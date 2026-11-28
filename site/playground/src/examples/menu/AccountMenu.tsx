import { useState } from "react";
import {
  Button,
  type ButtonLinkRenderProps,
  MenuContent,
  MenuItem,
  MenuRoot,
  MenuSeparator,
  MenuTrigger,
} from "@alien6-studio/elea-ui";

type LinkProps = Omit<ButtonLinkRenderProps, "href"> & { to: string };

function Link({ to, children, ...props }: LinkProps) {
  return <a href={to} {...props}>{children}</a>;
}

const renderLink = ({ href, ...props }: ButtonLinkRenderProps) => (
  <Link {...props} to={href} />
);

export function AccountMenu() {
  const [signedIn, setSignedIn] = useState(true);

  if (!signedIn) {
    return <Button onClick={() => setSignedIn(true)}>Sign in</Button>;
  }

  return (
    <MenuRoot>
      <MenuTrigger>
        {(props) => (
          <Button variant="outline" {...props}>
            Account
          </Button>
        )}
      </MenuTrigger>
      <MenuContent
        label="Account"
        header={
          <>
            <strong>Maya Okafor</strong>
            <br />
            Harbour Press
          </>
        }
      >
        <MenuItem href="/typography" render={renderLink}>
          Typography
        </MenuItem>
        <MenuItem href="/colours" render={renderLink}>
          Colours
        </MenuItem>
        <MenuItem href="/billing" render={renderLink} disabled>
          Billing
        </MenuItem>
        <MenuSeparator />
        <MenuItem onSelect={() => setSignedIn(false)}>Sign out</MenuItem>
      </MenuContent>
    </MenuRoot>
  );
}
