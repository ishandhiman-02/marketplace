import { useState, useMemo, useEffect, useRef } from 'react';
import { scrollToTop } from '../../lib/scroll';

/**
 * Client-side pagination over an already-filtered array.
 *
 * The admin loads a whole table in one request, so slicing happens here
 * rather than on the server. That is the right trade at this size — a few
 * hundred rows — and it keeps filtering instant. If leads ever run to
 * thousands, this is the seam to move server-side: the page/pageSize state
 * stays, only the source of `items` changes.
 */
export function usePagination(items, pageSize = 20, resetKey = '') {
  const [page, setPage] = useState(1);
  const anchorRef = useRef(null);

  // Changing a search or filter should land you on page 1, not on whatever
  // page number you happened to be sitting on. Callers pass their filter
  // state as resetKey rather than each writing the same effect.
  useEffect(() => { setPage(1); }, [resetKey]);

  const total = items.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  // A filter that shrinks the list can strand you on a page that no longer
  // exists, which looks like "my data disappeared".
  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  const goTo = (next) => {
    const clamped = Math.min(Math.max(1, next), pageCount);
    setPage(clamped);
    // Otherwise page 2 opens halfway down, still scrolled to where the old
    // page's last row was.
    scrollToTop(anchorRef.current);
  };

  return {
    page,
    pageCount,
    total,
    pageItems,
    goTo,
    /** Put on the element the list should scroll back to when paging. */
    anchorRef,
    from: total === 0 ? 0 : (page - 1) * pageSize + 1,
    to: Math.min(page * pageSize, total),
  };
}
