export function TailwindCard({ children, className = '' }) {
  return (
    <div className={`overflow-hidden bg-[var(--color-card)] shadow-[var(--shadow-sm)] sm:rounded-[var(--radius-lg)] border border-[var(--color-border)] ${className}`}>
      <div className="px-4 py-5 sm:p-6">{children}</div>
    </div>
  );
}

export function TailwindCardWithHeader({ title, headerContent, children, className = '' }) {
  return (
    <div className={`divide-y divide-[var(--color-border)] overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-card)] shadow-[var(--shadow-sm)] border border-[var(--color-border)] ${className}`}>
      <div className="px-4 py-5 sm:px-6">
        {title && <h3 className="text-[var(--text-base)] font-semibold text-[var(--text-primary)]">{title}</h3>}
        {headerContent}
      </div>
      <div className="px-4 py-5 sm:p-6">{children}</div>
    </div>
  );
}

export default TailwindCard;