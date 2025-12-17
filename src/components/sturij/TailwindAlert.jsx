import { ExclamationTriangleIcon, CheckCircleIcon, InformationCircleIcon, XCircleIcon } from '@heroicons/react/20/solid';

const alertStyles = {
  warning: {
    container: 'bg-yellow-50',
    icon: 'text-yellow-400',
    title: 'text-yellow-800',
    text: 'text-yellow-700',
    IconComponent: ExclamationTriangleIcon,
  },
  success: {
    container: 'bg-green-50',
    icon: 'text-green-400',
    title: 'text-green-800',
    text: 'text-green-700',
    IconComponent: CheckCircleIcon,
  },
  info: {
    container: 'bg-blue-50',
    icon: 'text-blue-400',
    title: 'text-blue-800',
    text: 'text-blue-700',
    IconComponent: InformationCircleIcon,
  },
  error: {
    container: 'bg-red-50',
    icon: 'text-red-400',
    title: 'text-red-800',
    text: 'text-red-700',
    IconComponent: XCircleIcon,
  },
};

export default function TailwindAlert({ type = 'warning', title, message }) {
  const styles = alertStyles[type] || alertStyles.warning;
  const Icon = styles.IconComponent;

  return (
    <div className={`rounded-md ${styles.container} p-4`}>
      <div className="flex">
        <div className="shrink-0">
          <Icon aria-hidden="true" className={`size-5 ${styles.icon}`} />
        </div>
        <div className="ml-3">
          <h3 className={`text-sm font-medium ${styles.title}`}>{title}</h3>
          <div className={`mt-2 text-sm ${styles.text}`}>
            <p>{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
}