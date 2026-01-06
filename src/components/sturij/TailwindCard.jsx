export function TailwindCard({ children, className = '' }) {
  return (
    <div className={`overflow-hidden bg-[var(--color-card)] shadow-sm sm:rounded-lg border border-[var(--color-border)] ${className}`}>
      <div className="px-4 py-5 sm:p-6">{children}</div>
    </div>
  );
}

export function TailwindCardWithHeader({ title, headerContent, children, className = '' }) {
  return (
    <div className={`divide-y divide-[var(--color-border)] overflow-hidden rounded-lg bg-[var(--color-card)] shadow-sm border border-[var(--color-border)] ${className}`}>
      <div className="px-4 py-5 sm:px-6">
        {title && <h3 className="text-base font-semibold text-[var(--text-primary)]">{title}</h3>}
        {headerContent}
      </div>
      <div className="px-4 py-5 sm:p-6">{children}</div>
    </div>
  );
}

export default TailwindCard;