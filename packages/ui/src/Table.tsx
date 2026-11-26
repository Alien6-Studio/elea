import { forwardRef, type HTMLAttributes, type ReactNode, type TdHTMLAttributes, type ThHTMLAttributes } from "react";
import { cx } from "./cx.js";
import { Skeleton } from "./Skeleton.js";

export interface TableProps extends Omit<HTMLAttributes<HTMLTableElement>, "className"> {
  /** Names the table; a wide table then scrolls inside a region the keyboard can reach. */
  label?: string | undefined;
  density?: "sm" | "md" | undefined;
  /** Tints every other row. */
  striped?: boolean | undefined;
  /** Rows answer the pointer. */
  hoverable?: boolean | undefined;
  /** The header row stays in view while the body scrolls; give the table a height through `className`. */
  stickyHeader?: boolean | undefined;
  className?: string | undefined;
}

/** A data table that scrolls sideways on its own instead of widening the page; compose it with the `Table…` parts below. */
export const Table = forwardRef<HTMLTableElement, TableProps>(function Table({ label, density, striped = false, hoverable = false, stickyHeader = false, className, ...rest }, ref) {
  return (
    <div {...(label ? { role: "region", "aria-label": label, tabIndex: 0 } : {})} className={cx("elea-table", `elea-table--${density ?? "md"}`, striped && "elea-table--striped", hoverable && "elea-table--hoverable", stickyHeader && "elea-table--sticky", className)} data-density={density}>
      <table {...rest} ref={ref} />
    </div>
  );
});

export interface TablePartProps<Element extends HTMLElement = HTMLTableSectionElement> extends Omit<HTMLAttributes<Element>, "className"> {
  className?: string | undefined;
}

export function TableCaption({ className, ...rest }: Readonly<TablePartProps<HTMLTableCaptionElement>>) {
  return <caption {...rest} className={cx("elea-table__caption", className)} />;
}

export function TableHead(props: Readonly<TablePartProps>) {
  return <thead {...props} />;
}

export function TableBody(props: Readonly<TablePartProps>) {
  return <tbody {...props} />;
}

export function TableFoot(props: Readonly<TablePartProps>) {
  return <tfoot {...props} />;
}

export interface TableRowProps extends TablePartProps<HTMLTableRowElement> {
  /** Tints the row; say it to assistive technology through the row's own control, such as its checkbox. */
  selected?: boolean | undefined;
}

export function TableRow({ selected, ...rest }: Readonly<TableRowProps>) {
  return <tr data-selected={selected || undefined} {...rest} />;
}

export type TableSort = "ascending" | "descending" | "none";

export interface TableHeaderCellProps extends Omit<ThHTMLAttributes<HTMLTableCellElement>, "className" | "align"> {
  align?: "start" | "center" | "end" | undefined;
  /** How this column is sorted; with `onSort` the heading becomes a button. */
  sort?: TableSort | undefined;
  onSort?: (() => void) | undefined;
  className?: string | undefined;
  children?: ReactNode;
}

/** A column heading, or a row heading with `scope="row"`. */
export function TableHeaderCell({ align = "start", sort, onSort, scope = "col", className, children, ...rest }: Readonly<TableHeaderCellProps>) {
  return (
    <th scope={scope} aria-sort={onSort ? sort ?? "none" : sort} {...rest} className={cx(align !== "start" && `elea-table__cell--${align}`, className) || undefined}>
      {onSort ? (
        <button type="button" className="elea-table__sort" onClick={onSort}>
          {children}
          <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 5v14M6 11l6-6 6 6" /></svg>
        </button>
      ) : children}
    </th>
  );
}

export interface TableCellProps extends Omit<TdHTMLAttributes<HTMLTableCellElement>, "className" | "align"> {
  align?: "start" | "center" | "end" | undefined;
  /** Figures align to the end, where their digits line up. */
  numeric?: boolean | undefined;
  className?: string | undefined;
}

export function TableCell({ align, numeric = false, className, ...rest }: Readonly<TableCellProps>) {
  const side = align ?? (numeric ? "end" : "start");
  return <td {...rest} className={cx(side !== "start" && `elea-table__cell--${side}`, className) || undefined} />;
}

export interface TableSkeletonProps extends Pick<TableProps, "density" | "striped" | "className"> {
  /** Body rows to hold; 3 by default. */
  rows?: number | undefined;
  /** 3 by default. */
  columns?: number | undefined;
  /** Holds the header row; on by default. */
  header?: boolean | undefined;
}

/** The placeholder of a `Table`: the table itself, a line of text held in every cell. */
export function TableSkeleton({ rows = 3, columns = 3, header = true, ...table }: Readonly<TableSkeletonProps>) {
  const cells = Array.from({ length: columns }, (_, column) => column);
  return (
    <Table {...table} aria-hidden="true">
      {header && (
        <TableHead>
          <TableRow>{cells.map((column) => <TableHeaderCell key={column}><Skeleton width="50%" /></TableHeaderCell>)}</TableRow>
        </TableHead>
      )}
      <TableBody>
        {Array.from({ length: rows }, (_, row) => (
          <TableRow key={row}>{cells.map((column) => <TableCell key={column}><Skeleton width="75%" /></TableCell>)}</TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
