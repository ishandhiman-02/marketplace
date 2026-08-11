/**
 * Title, one line of context, and the page's primary action.
 * Every admin page opened with a slightly different heading block before;
 * this keeps the eye landing in the same place on every screen.
 */
export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="flex items-start justify-between gap-4 flex-wrap mb-7">
      <div className="min-w-0">
        <h1 className="text-[28px] font-bold text-ink leading-tight" style={{ letterSpacing: '-0.8px' }}>
          {title}
        </h1>
        {subtitle && <p className="text-sm text-muted mt-1.5 max-w-xl">{subtitle}</p>}
      </div>
      {children && <div className="flex items-center gap-2.5 shrink-0">{children}</div>}
    </div>
  );
}
