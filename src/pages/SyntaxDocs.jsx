import { ChevronRight, Hash } from 'lucide-react';

function Sidebar() {
  const sections = [
    {
      title: 'Getting Started',
      items: ['Introduction', 'Installation', 'Quick Start'],
    },
    {
      title: 'Core Concepts',
      items: ['Architecture', 'Components', 'State Management'],
    },
    {
      title: 'API Reference',
      items: ['Authentication', 'Endpoints', 'Error Codes'],
    },
  ];

  return (
    <aside className="w-64 flex-shrink-0 border-r border-gray-200 bg-white p-6">
      <nav className="space-y-6">
        {sections.map((section) => (
          <div key={section.title}>
            <h3 className="text-sm font-semibold text-gray-900">{section.title}</h3>
            <ul className="mt-3 space-y-2">
              {section.items.map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="block text-sm text-gray-600 hover:text-gray-900 hover:translate-x-1 transition-transform"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}

function TableOfContents() {
  const headings = [
    'Quis vel iste dicta',
    'Quos porro ut molestiae',
    'Vitae laborum maiores',
  ];

  return (
    <aside className="hidden xl:block w-64 flex-shrink-0 p-6">
      <div className="sticky top-24">
        <h4 className="text-sm font-semibold text-gray-900 mb-4">On this page</h4>
        <ul className="space-y-2">
          {headings.map((heading) => (
            <li key={heading}>
              <a
                href="#"
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
              >
                <Hash className="h-3 w-3" />
                <span>{heading}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

export default function SyntaxDocs() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <span className="text-xl font-bold text-gray-900">Syntax</span>
              <nav className="hidden md:flex gap-6">
                <a href="#" className="text-sm font-medium text-indigo-600">
                  Documentation
                </a>
                <a href="#" className="text-sm font-medium text-gray-700 hover:text-gray-900">
                  Guides
                </a>
                <a href="#" className="text-sm font-medium text-gray-700 hover:text-gray-900">
                  API Reference
                </a>
              </nav>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 px-8 py-12 max-w-4xl">
          <nav className="flex items-center gap-2 text-sm text-gray-600 mb-8">
            <a href="#" className="hover:text-gray-900">Documentation</a>
            <ChevronRight className="h-4 w-4" />
            <span className="text-gray-900">Architecture guide</span>
          </nav>

          <article className="prose prose-gray max-w-none">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-4">
              Architecture guide
            </h1>
            <p className="text-lg text-gray-600">
              Quasi sapiente voluptates aut minima non doloribus similique quisquam. 
              In quo expedita ipsum nostrum corrupti incidunt. Et aut eligendi ea perferendis.
            </p>

            <hr className="my-8 border-gray-200" />

            <h2 id="quis-vel" className="text-2xl font-bold text-gray-900 mt-12 mb-4">
              Quis vel iste dicta
            </h2>
            <p className="text-gray-700">
              Sit commodi iste iure molestias qui amet voluptatem sed quaerat. Nostrum aut 
              pariatur. Sint ipsa praesentium dolor error cumque velit tenetur.
            </p>

            <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">
              Et pariatur ab quas
            </h3>
            <p className="text-gray-700 mb-4">
              Sit commodi iste iure molestias qui amet voluptatem sed quaerat. Nostrum aut 
              pariatur. Sint ipsa praesentium dolor error cumque velit tenetur quaerat 
              exercitationem.
            </p>

            <pre className="rounded-lg bg-gray-900 p-4 overflow-x-auto">
              <code className="text-sm text-gray-100">
{`/** @type {import('@tailwindlabs/lorem').ipsum} */
export default {
  lorem: 'ipsum',
  dolor: ['sit', 'amet', 'consectetur'],
  adipiscing: {
    elit: true,
  },
}`}
              </code>
            </pre>

            <p className="text-gray-700 mt-4">
              Possimus saepe veritatis sint nobis et quam eos. Architecto consequatur odit 
              perferendis fuga eveniet possimus rerum cumque. Ea deleniti voluptatum deserunt 
              voluptatibus ut non iste.
            </p>

            <hr className="my-8 border-gray-200" />

            <h2 id="quos-porro" className="text-2xl font-bold text-gray-900 mt-12 mb-4">
              Quos porro ut molestiae
            </h2>
            <p className="text-gray-700">
              Sit commodi iste iure molestias qui amet voluptatem sed quaerat. Nostrum aut 
              pariatur. Sint ipsa praesentium dolor error cumque velit tenetur.
            </p>

            <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-4">
              <p className="text-sm text-blue-900">
                <strong>Note:</strong> This is an important callout that you should pay 
                attention to when implementing this feature.
              </p>
            </div>
          </article>

          <div className="mt-12 flex items-center justify-between border-t border-gray-200 pt-8">
            <a href="#" className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900">
              ← Previous: Installation
            </a>
            <a href="#" className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900">
              Next: Components →
            </a>
          </div>
        </main>

        <TableOfContents />
      </div>
    </div>
  );
}