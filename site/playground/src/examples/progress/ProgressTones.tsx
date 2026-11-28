import { Progress } from "@alien6-studio/elea-ui";

export function ProgressTones() {
  return (
    <>
      <Progress size="sm" value={30} aria-label="Storage used" />
      <Progress tone="success" value={100} label="Published" showValue />
      <Progress tone="info" value={45} label="Import" showValue />
      <Progress tone="warning" value={82} label="Storage" showValue />
      <Progress size="lg" tone="danger" value={96} label="Quota" showValue />
    </>
  );
}
