import { Alert } from "@alien6-studio/elea-ui";

const css = `
.house-alerts {
  display: grid;
  gap: 0.65rem;
  --elea-alert-success-surface: light-dark(#e3f1e7, #12301f);
  --elea-alert-success-border: light-dark(#2f7d4f, #62b884);
  --elea-alert-success-text: light-dark(#133d26, #d3efdd);
  --elea-alert-danger-surface: light-dark(#fbe9e6, #3a1613);
  --elea-alert-danger-border: light-dark(#b3261e, #ee8a82);
  --elea-alert-danger-text: light-dark(#5a1410, #fad7d3);
}
`;

export function HouseAlerts() {
  return (
    <>
      <style>{css}</style>
      <div className="house-alerts">
        <Alert tone="success" title="Article published">
          It is now visible to everyone.
        </Alert>
        <Alert tone="danger" title="The article could not be saved">
          Check your connection and try again.
        </Alert>
        <Alert tone="info" title="Maintenance is planned for Sunday" />
      </div>
    </>
  );
}
