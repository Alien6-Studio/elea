import { Tooltip } from "@alien6-studio/elea-ui";

export function TruncatedTitle() {
  return (
    <>
      <div className="report-title">
        <Tooltip content="Quarterly revenue by region">
          <span className="report-title__text">
            Quarterly revenue by region
          </span>
        </Tooltip>
      </div>
      <span>
        <Tooltip content="Bare text takes a hint too">Plain text</Tooltip>
      </span>
    </>
  );
}
