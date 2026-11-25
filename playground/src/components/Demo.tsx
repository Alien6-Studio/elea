import { useRef, useState, type ReactNode } from "react";
import { Button } from "@alien6-studio/elea-ui";

export interface DemoProps {
  title?: string;
  description?: ReactNode;
  children: ReactNode;
  /** The code shown under the demo. */
  code: string;
}

/** A live example with its source. */
export function Demo({ title, description, children, code }: DemoProps) {
  const source = code.trim();
  const block = useRef<HTMLElement>(null);
  const [message, setMessage] = useState("");
  async function copy() {
    try {
      await navigator.clipboard.writeText(source);
      setMessage("Copied");
    } catch {
      const selection = window.getSelection();
      if (selection && block.current) {
        const range = document.createRange();
        range.selectNodeContents(block.current);
        selection.removeAllRanges();
        selection.addRange(range);
        setMessage("Code selected. Use your copy shortcut.");
      } else {
        setMessage("Select the code and copy it manually.");
      }
    }
  }
  return (
    <section className="demo">
      {title && <h2 className="demo__title">{title}</h2>}
      {description && <p className="demo__description">{description}</p>}
      <div className="demo__stage">{children}</div>
      <details className="catalog-source" onToggle={() => setMessage("")}>
        <summary>View code</summary>
        <div className="catalog-source__bar">
          <span role="status">{message}</span>
          <Button type="button" size="sm" variant="outline" onClick={copy}>Copy code</Button>
        </div>
        <pre className="demo__code" tabIndex={0} aria-label={`${title ?? "Example"} source`}><code ref={block}>{source}</code></pre>
      </details>
    </section>
  );
}

export interface PropRow {
  name: string;
  type: string;
  description: string;
  defaultValue?: string;
}

/** The props of a component, or the parts it is composed from, as a table. */
export function PropsTable({ rows, parts = false }: { rows: PropRow[]; parts?: boolean }) {
  return (
    <div className="catalog-props" role="region" aria-label={parts ? "Component parts" : "Component props"} tabIndex={0}>
      <table className="props">
        <thead>
          <tr>
            <th scope="col">{parts ? "Part" : "Prop"}</th>
            <th scope="col">{parts ? "Props" : "Type"}</th>
            <th scope="col">Default</th>
            <th scope="col">Description</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name}>
              <th scope="row"><code>{row.name}</code></th>
              <td><code>{row.type}</code></td>
              <td>{row.defaultValue ? <code>{row.defaultValue}</code> : "—"}</td>
              <td>{row.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
