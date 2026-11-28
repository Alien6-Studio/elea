import { Button, Separator } from "@alien6-studio/elea-ui";

export function SignInChoice() {
  return (
    <>
      <Button variant="outline">Continue with a passkey</Button>
      <Separator>or</Separator>
      <Button>Sign in with email</Button>
    </>
  );
}
