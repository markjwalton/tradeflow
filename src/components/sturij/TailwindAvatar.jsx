export default function TailwindAvatar({ 
  src, 
  alt = '', 
  size = 'md', 
  notification = null, // 'online', 'offline', 'busy', null, or number
  className = '' 
}) {
  const sizeClasses = {
    xs: 'size-6',
    sm: 'size-8',
    md: 'size-10',
    lg: 'size-12',
    xl: 'size-14',
    '2xl': 'size-16',
  };

  const badgeSizeClasses = {
    xs: 'size-1.5',
    sm: 'size-2',
    md: 'size-2.5',
    lg: 'size-3',
    xl: 'size-3.5',
    '2xl': 'size-4',
  };

  const notificationColors = {
    online: 'bg-green-400',
    offline: 'bg-gray-300',
    busy: 'bg-red-400',
  };

  const getBadgeColor = () => {
    if (typeof notification === 'number') {
      return 'bg-red-400';
    }
    return notificationColors[notification] || 'bg-gray-300';
  };

  const showBadge = notification !== null && notification !== undefined;

  return (
    <span className={`relative inline-block ${className}`}>
      <img
        alt={alt}
        src={src}
        className={`${sizeClasses[size]} rounded-md outline -outline-offset-1 outline-black/5`}
      />
      {showBadge && (
        <span
          className={`absolute top-0 right-0 block ${badgeSizeClasses[size]} translate-x-1/2 -translate-y-1/2 transform rounded-full ${getBadgeColor()} ring-2 ring-white`}
        >
          {typeof notification === 'number' && notification > 0 && (
            <span className="flex items-center justify-center text-[8px] font-bold text-white">
              {notification > 9 ? '9+' : notification}
            </span>
          )}
        </span>
      )}
    </span>
  );
}