import type { ReactNode } from "react";

export interface DemoProps {
  title?: string;
  description?: ReactNode;
  children: ReactNode;
  /** The code shown under the demo. */
  code: string;
}

/** A live example with its source. */
export function Demo({ title, description, children, code }: DemoProps) {
  return (
    <section className="demo">
      {title && <h3 className="demo__title">{title}</h3>}
      {description && <p className="demo__description">{description}</p>}
      <div className="demo__stage">{children}</div>
      <pre className="demo__code"><code>{code.trim()}</code></pre>
    </section>
  );
}

export interface PropRow {
  name: string;
  type: string;
  description: string;
  defaultValue?: string;
}

/** The props of a component, as a table. */
export function PropsTable({ rows }: { rows: PropRow[] }) {
  return (
    <table className="props">
      <thead>
        <tr>
          <th>Prop</th>
          <th>Type</th>
          <th>Default</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.name}>
            <td><code>{row.name}</code></td>
            <td><code>{row.type}</code></td>
            <td>{row.defaultValue ? <code>{row.defaultValue}</code> : "—"}</td>
            <td>{row.description}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
