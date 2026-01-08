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
    <div className={cn("text-center py-12", className)}>
      <Icon 
        className="mx-auto h-12 w-12 text-muted-foreground/40" 
        strokeWidth={1.5}
      />
      <h3 className="mt-2 text-sm font-semibold text-foreground">
        {title}
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
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