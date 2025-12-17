import { HomeIcon } from '@heroicons/react/20/solid';

export default function TailwindBreadcrumb({ pages = [] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex">
      <ol role="list" className="flex items-center space-x-4 rounded-md bg-white px-6 shadow-sm">
        <li className="flex">
          <div className="flex items-center">
            <a href="#" className="text-muted hover:text-secondary">
              <HomeIcon aria-hidden="true" className="size-5 shrink-0" />
              <span className="sr-only">Home</span>
            </a>
          </div>
        </li>
        {pages.map((page) => (
          <li key={page.name} className="flex">
            <div className="flex items-center">
              <svg
                fill="currentColor"
                viewBox="0 0 24 44"
                preserveAspectRatio="none"
                aria-hidden="true"
                className="h-full w-6 shrink-0 text-subtle"
              >
                <path d="M.293 0l22 22-22 22h1.414l22-22-22-22H.293z" />
              </svg>
              <a
                href={page.href}
                aria-current={page.current ? 'page' : undefined}
                className="ml-4 font-display text-sm font-medium text-secondary hover:text-primary"
              >
                {page.name}
              </a>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}