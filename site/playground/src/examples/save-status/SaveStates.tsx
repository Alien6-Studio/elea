import { SaveStatus } from "@alien6-studio/elea-ui";

export function SaveStates() {
  return (
    <>
      <SaveStatus state="idle">Draft</SaveStatus>
      <SaveStatus state="saving">Saving</SaveStatus>
      <SaveStatus state="saved">Saved at 12:12</SaveStatus>
      <SaveStatus state="error" onRetry={() => {}} retryLabel="Retry">
        Not saved
      </SaveStatus>
    </>
  );
}
