export function TailwindCard({ children, className = '' }) {
  return (
    <div className={`overflow-hidden bg-white shadow-sm sm:rounded-lg ${className}`}>
      <div className="px-4 py-5 sm:p-6">{children}</div>
    </div>
  );
}

export function TailwindCardWithHeader({ title, headerContent, children, className = '' }) {
  return (
    <div className={`divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow-sm ${className}`}>
      <div className="px-4 py-5 sm:px-6">
        {title && <h3 className="text-base font-semibold text-gray-900">{title}</h3>}
        {headerContent}
      </div>
      <div className="px-4 py-5 sm:p-6">{children}</div>
    </div>
  );
}

export default TailwindCard;