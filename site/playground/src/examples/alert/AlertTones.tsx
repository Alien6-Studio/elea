import { Alert } from "@alien6-studio/elea-ui";
import { InfoIcon } from "../icons";

export function AlertTones() {
  return (
    <>
      <Alert title="Draft saved">Your changes are kept on this device.</Alert>
      <Alert
        tone="primary"
        icon={<InfoIcon />}
        title="A new version is available"
      />
      <Alert tone="success" title="Article published">
        It is now visible to everyone.
      </Alert>
      <Alert
        tone="info"
        icon={<InfoIcon />}
        title="Maintenance is planned for Sunday"
      />
      <Alert tone="warning" title="Your session ends in five minutes" />
      <Alert tone="danger" title="The article could not be saved">
        Check your connection and try again.
      </Alert>
    </>
  );
}
