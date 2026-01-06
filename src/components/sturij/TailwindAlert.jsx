import { ExclamationTriangleIcon, CheckCircleIcon, InformationCircleIcon, XCircleIcon } from '@heroicons/react/20/solid';

const alertStyles = {
  warning: {
    container: 'bg-[var(--secondary-100)] border border-[var(--secondary-300)]',
    icon: 'text-[var(--secondary-500)]',
    title: 'text-[var(--secondary-800)]',
    text: 'text-[var(--secondary-700)]',
    IconComponent: ExclamationTriangleIcon,
  },
  success: {
    container: 'bg-[var(--primary-100)] border border-[var(--primary-300)]',
    icon: 'text-[var(--primary-500)]',
    title: 'text-[var(--primary-800)]',
    text: 'text-[var(--primary-700)]',
    IconComponent: CheckCircleIcon,
  },
  info: {
    container: 'bg-[var(--midnight-100)] border border-[var(--midnight-300)]',
    icon: 'text-[var(--midnight-500)]',
    title: 'text-[var(--midnight-800)]',
    text: 'text-[var(--midnight-700)]',
    IconComponent: InformationCircleIcon,
  },
  error: {
    container: 'bg-[var(--destructive-100)] border border-[var(--destructive-300)]',
    icon: 'text-[var(--destructive-500)]',
    title: 'text-[var(--destructive-800)]',
    text: 'text-[var(--destructive-700)]',
    IconComponent: XCircleIcon,
  },
};

export default function TailwindAlert({ type = 'warning', title, message }) {
  const styles = alertStyles[type] || alertStyles.warning;
  const Icon = styles.IconComponent;

  return (
    <div className={`rounded-[var(--radius-lg)] ${styles.container} p-4`}>
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