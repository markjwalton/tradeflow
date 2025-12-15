import { clsx } from 'clsx';

export function Screenshot({ width, height, src, className }) {
  return (
    <div
      style={{ 
        aspectRatio: `${width}/${height}`,
      }}
      className={clsx(
        className,
        'relative'
      )}
    >
      <div className="absolute -inset-2 rounded-[calc(theme(borderRadius.xl)+theme(spacing.2))] shadow-xs ring-1 ring-black/5" />
      <img
        alt=""
        src={src}
        className="h-full rounded-xl shadow-2xl ring-1 ring-black/10"
      />
    </div>
  );
}