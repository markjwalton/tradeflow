import { HomeIcon } from '@heroicons/react/20/solid';
import { createPageUrl } from '@/utils';

export default function TailwindBreadcrumb({ pages = [], homeHref }) {
  const homePage = homeHref || createPageUrl('Dashboard');
  
  return (
    <nav aria-label="Breadcrumb" className="flex">
      <ol role="list" className="flex items-center space-x-4 rounded-[var(--radius-md)] bg-[var(--color-card)] px-6 shadow-[var(--shadow-sm)] border border-[var(--color-border)]">
        <li className="flex">
          <div className="flex items-center">
            <a href={homePage} className="text-[var(--text-muted)] hover:text-[var(--text-secondary)]">
              <HomeIcon aria-hidden="true" className="size-5 shrink-0" />
              <span className="sr-only">Home</span>
            </a>
          </div>
        </li>
        {pages.map((page, index) => (
          <li key={page.name + index} className="flex">
            <div className="flex items-center">
              <svg
                fill="currentColor"
                viewBox="0 0 24 44"
                preserveAspectRatio="none"
                aria-hidden="true"
                className="h-full w-6 shrink-0 text-[var(--background-300)]"
              >
                <path d="M.293 0l22 22-22 22h1.414l22-22-22-22H.293z" />
              </svg>
              {page.current ? (
                <span
                  aria-current="page"
                  className="ml-4 text-[var(--text-sm)] font-medium text-[var(--text-primary)]"
                >
                  {page.name}
                </span>
              ) : (
                <a
                  href={page.href}
                  className="ml-4 text-[var(--text-sm)] font-medium text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                >
                  {page.name}
                </a>
              )}
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}