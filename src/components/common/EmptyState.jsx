import { FolderPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function EmptyState({
  icon: Icon = FolderPlus,
  title = 'No items',
  description = 'Get started by creating a new item.',
  actionLabel = 'Create New',
  onAction,
  className
}) {
  return (
    <div className={cn("text-center py-12 bg-[var(--primary-50)] rounded-[var(--radius-lg)] border border-[var(--primary-100)]", className)}>
      <Icon 
        className="mx-auto h-12 w-12 text-[var(--accent-500)]" 
        strokeWidth={1.25}
      />
      <h3 className="mt-2 text-base font-medium font-[family-name:var(--font-family-display)] text-[var(--accent-500)]">
        {title}
      </h3>
      <p className="mt-1 text-sm text-[var(--charcoal-800)] leading-[var(--leading-normal)]">
        {description}
      </p>
      {onAction && (
        <div className="mt-6">
          <Button onClick={onAction} size="sm">
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}