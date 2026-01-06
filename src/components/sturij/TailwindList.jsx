export default function TailwindList({ items = [], renderItem, className = '' }) {
  return (
    <ul role="list" className={`divide-y divide-[var(--color-border)] ${className}`}>
      {items.map((item, index) => (
        <li key={item.id || index} className="py-4">
          {renderItem(item, index)}
        </li>
      ))}
    </ul>
  );
}