import { clsx } from 'clsx';

export function Gradient({ className, ...props }) {
  return (
    <div
      {...props}
      className={clsx(
        className,
        'bg-gradient-to-br from-[#fff1be] via-[#ee87cb] to-[#b060ff]'
      )}
      style={{
        backgroundImage: 'linear-gradient(115deg, #fff1be 28%, #ee87cb 70%, #b060ff)',
      }}
    />
  );
}

export function GradientBackground() {
  return (
    <div className="relative mx-auto max-w-7xl">
      <div
        className={clsx(
          'absolute -top-44 -right-60 h-60 w-[36rem] transform-gpu md:right-0',
          'rotate-[-10deg] rounded-full blur-3xl'
        )}
        style={{
          backgroundImage: 'linear-gradient(115deg, #fff1be 28%, #ee87cb 70%, #b060ff)',
        }}
      />
    </div>
  );
}