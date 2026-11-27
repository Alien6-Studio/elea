import { Button, type ButtonLinkRenderProps } from "@alien6-studio/elea-ui";

type LinkProps = Omit<ButtonLinkRenderProps, "href"> & { to: string };

function Link({ to, ...props }: LinkProps) {
  return <a href={to} {...props} />;
}

const renderLink = ({ href, ...props }: ButtonLinkRenderProps) => (
  <Link {...props} to={href} />
);

export function GuideLinks() {
  return (
    <>
      <Button href="/guides/card" render={renderLink}>
        Open Card guide
      </Button>
      <Button href="/guides/card" render={renderLink} disabled>
        Guide unavailable
      </Button>
    </>
  );
}
