import { HomeIcon } from '@heroicons/react/20/solid';
import { createPageUrl } from '@/utils';

export default function TailwindBreadcrumb({ pages = [], homeHref }) {
  const homePage = homeHref || createPageUrl('Dashboard');
  
  return (
    <nav aria-label="Breadcrumb" className="flex">
      <ol role="list" className="flex items-center space-x-4 rounded-md bg-white px-6 shadow-sm">
        <li className="flex">
          <div className="flex items-center">
            <a href={homePage} className="text-gray-400 hover:text-gray-500">
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
                className="h-full w-6 shrink-0 text-gray-200"
              >
                <path d="M.293 0l22 22-22 22h1.414l22-22-22-22H.293z" />
              </svg>
              {page.current ? (
                <span
                  aria-current="page"
                  className="ml-4 text-sm font-medium text-gray-900"
                >
                  {page.name}
                </span>
              ) : (
                <a
                  href={page.href}
                  className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700"
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