import { cx } from "./cx.js";

export interface PaginationLabels {
  /** Accessible name of the navigation, e.g. "Pagination". */
  navigation: string;
  previous: string;
  next: string;
  /** Name of a page button, with `{page}`, e.g. "Page {page}". */
  page: string;
  /** Visible summary, with `{from}`, `{to}` and `{total}`; omitted when `totalItems` is unknown. */
  summary?: string | undefined;
}

export interface PaginationProps {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  labels: PaginationLabels;
  /** Number of page buttons shown around the current one; defaults to 5. */
  window?: number | undefined;
  totalItems?: number | undefined;
  pageSize?: number | undefined;
  className?: string | undefined;
}

/** The pages to show: first and last always, a window around the current page, gaps as null. */
export function paginationRange(page: number, pageCount: number, window = 5): Array<number | null> {
  if (pageCount <= window + 2) return Array.from({ length: pageCount }, (_, index) => index + 1);
  const half = Math.floor(window / 2);
  let start = Math.max(2, page - half);
  let end = Math.min(pageCount - 1, start + window - 1);
  start = Math.max(2, end - window + 1);
  const pages: Array<number | null> = [1];
  if (start > 2) pages.push(null);
  for (let index = start; index <= end; index += 1) pages.push(index);
  if (end < pageCount - 1) pages.push(null);
  pages.push(pageCount);
  return pages;
}

const fill = (template: string, values: Record<string, number>) => template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));

/** Page navigation with previous and next, numbered pages and an optional summary. */
export function Pagination({ page, pageCount, onPageChange, labels, window = 5, totalItems, pageSize, className }: PaginationProps) {
  if (pageCount <= 1 && totalItems === undefined) return null;
  const pages = paginationRange(page, pageCount, window);
  const from = totalItems !== undefined && pageSize ? Math.min(totalItems, (page - 1) * pageSize + 1) : 0;
  const to = totalItems !== undefined && pageSize ? Math.min(totalItems, page * pageSize) : 0;
  return (
    <nav className={cx("elea-pagination", className)} aria-label={labels.navigation}>
      {labels.summary && totalItems !== undefined && <span className="elea-pagination__summary">{fill(labels.summary, { from, to, total: totalItems })}</span>}
      {pageCount > 1 && (
        <ul className="elea-pagination__list">
          <li>
            <button type="button" className="elea-pagination__button" onClick={() => onPageChange(page - 1)} disabled={page <= 1} aria-label={labels.previous}>‹</button>
          </li>
          {pages.map((candidate, index) =>
            candidate === null ? (
              <li key={`gap-${index}`} className="elea-pagination__gap" aria-hidden="true">…</li>
            ) : (
              <li key={candidate}>
                <button type="button" className={cx("elea-pagination__button", candidate === page && "elea-pagination__button--current")} onClick={() => onPageChange(candidate)} aria-current={candidate === page ? "page" : undefined} aria-label={fill(labels.page, { page: candidate })}>
                  {candidate}
                </button>
              </li>
            ),
          )}
          <li>
            <button type="button" className="elea-pagination__button" onClick={() => onPageChange(page + 1)} disabled={page >= pageCount} aria-label={labels.next}>›</button>
          </li>
        </ul>
      )}
    </nav>
  );
}
