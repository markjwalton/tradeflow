import { clsx } from 'clsx';

export function LogoCloud({ className }) {
  return (
    <div
      className={clsx(
        className,
        'flex justify-between max-sm:mx-auto max-sm:max-w-md max-sm:flex-wrap max-sm:justify-evenly max-sm:gap-x-4 max-sm:gap-y-4'
      )}
    >
      <div className="h-9 w-32 bg-gray-200 rounded max-sm:mx-auto sm:h-8 lg:h-12" />
      <div className="h-9 w-32 bg-gray-200 rounded max-sm:mx-auto sm:h-8 lg:h-12" />
      <div className="h-9 w-32 bg-gray-200 rounded max-sm:mx-auto sm:h-8 lg:h-12" />
      <div className="h-9 w-32 bg-gray-200 rounded max-sm:mx-auto sm:h-8 lg:h-12" />
      <div className="h-9 w-32 bg-gray-200 rounded max-sm:mx-auto sm:h-8 lg:h-12" />
    </div>
  );
}