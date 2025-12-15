import React from 'react';
import { PageHeader } from '@/components/sturij/PageHeader';
import ShowcaseSection from '@/components/showcase/ShowcaseSection';
import { Star, Check, Heart, Minus, Plus, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

// Sample product data
const basicProduct = {
  name: 'Basic Tee',
  price: '$35',
  rating: 3.9,
  reviewCount: 512,
  href: '#',
  images: [
    {
      id: 1,
      imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/product-page-01-featured-product-shot.jpg',
      imageAlt: "Back of women's Basic Tee in black.",
      primary: true,
    },
    {
      id: 2,
      imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/product-page-01-product-shot-01.jpg',
      imageAlt: "Side profile of women's Basic Tee in black.",
      primary: false,
    },
  ],
  colors: [
    { id: 'black', name: 'Black', classes: 'bg-gray-900' },
    { id: 'heather-grey', name: 'Heather Grey', classes: 'bg-gray-400' },
  ],
  sizes: [
    { id: 'xs', name: 'XS', inStock: true },
    { id: 's', name: 'S', inStock: true },
    { id: 'm', name: 'M', inStock: true },
    { id: 'l', name: 'L', inStock: true },
    { id: 'xl', name: 'XL', inStock: false },
  ],
  description: 'The Basic tee is an honest new take on a classic.',
};

const relatedProducts = [
  {
    id: 1,
    name: 'Basic Tee',
    href: '#',
    imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/product-page-01-related-product-01.jpg',
    imageAlt: "Front of men's Basic Tee in black.",
    price: '$35',
    color: 'Black',
  },
  {
    id: 2,
    name: 'Basic Tee',
    href: '#',
    imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/product-page-01-related-product-02.jpg',
    imageAlt: "Front of men's Basic Tee in white.",
    price: '$35',
    color: 'Aspen White',
  },
  {
    id: 3,
    name: 'Basic Tee',
    href: '#',
    imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/product-page-01-related-product-03.jpg',
    imageAlt: "Front of men's Basic Tee in dark gray.",
    price: '$35',
    color: 'Charcoal',
  },
  {
    id: 4,
    name: 'Artwork Tee',
    href: '#',
    imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/product-page-01-related-product-04.jpg',
    imageAlt: "Front of men's Artwork Tee in peach.",
    price: '$35',
    color: 'Iso Dots',
  },
];

const trendingProducts = [
  {
    id: 1,
    name: 'Leather Long Wallet',
    color: 'Natural',
    price: '$75',
    href: '#',
    imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/home-page-04-trending-product-02.jpg',
    imageAlt: 'Hand stitched, orange leather long wallet.',
  },
  {
    id: 2,
    name: 'Machined Pencil Set',
    color: 'Black',
    price: '$70',
    href: '#',
    imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/home-page-04-trending-product-03.jpg',
    imageAlt: '12-sided, machined black pencil.',
  },
  {
    id: 3,
    name: 'Mini-Sketchbooks',
    color: 'Light Brown',
    price: '$27',
    href: '#',
    imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/home-page-04-trending-product-04.jpg',
    imageAlt: 'Set of three mini sketch books.',
  },
  {
    id: 4,
    name: 'Organizer Set',
    color: 'Walnut',
    price: '$149',
    href: '#',
    imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/home-page-04-trending-product-01.jpg',
    imageAlt: 'Walnut organizer set.',
  },
];

const productGrid = [
  {
    id: 1,
    name: 'Earthen Bottle',
    href: '#',
    price: '$48',
    imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/category-page-04-image-card-01.jpg',
    imageAlt: 'Tall slender porcelain bottle.',
  },
  {
    id: 2,
    name: 'Nomad Tumbler',
    href: '#',
    price: '$35',
    imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/category-page-04-image-card-02.jpg',
    imageAlt: 'Olive drab insulated bottle.',
  },
  {
    id: 3,
    name: 'Focus Paper Refill',
    href: '#',
    price: '$89',
    imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/category-page-04-image-card-03.jpg',
    imageAlt: 'Productivity paper card.',
  },
  {
    id: 4,
    name: 'Machined Pencil',
    href: '#',
    price: '$35',
    imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/category-page-04-image-card-04.jpg',
    imageAlt: 'Machined steel pencil.',
  },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function TailwindProductShowcase() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Product Showcase"
        description="E-commerce product layouts and patterns from Tailwind UI"
      />

      <div className="space-y-4">
        <ShowcaseSection title="Related Products - Simple Grid" defaultOpen>
          <div className="bg-white p-8 rounded-lg">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-6">Customers also purchased</h2>
              <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
                {relatedProducts.map((product) => (
                  <div key={product.id} className="group relative">
                    <img
                      alt={product.imageAlt}
                      src={product.imageSrc}
                      className="aspect-square w-full rounded-md bg-gray-200 object-cover group-hover:opacity-75"
                    />
                    <div className="mt-4 flex justify-between">
                      <div>
                        <h3 className="text-sm text-gray-700">
                          <a href={product.href}>
                            <span aria-hidden="true" className="absolute inset-0" />
                            {product.name}
                          </a>
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">{product.color}</p>
                      </div>
                      <p className="text-sm font-medium text-gray-900">{product.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="Trending Products with CTA">
          <div className="bg-white p-8 rounded-lg">
            <div className="max-w-7xl mx-auto">
              <div className="md:flex md:items-center md:justify-between mb-6">
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">Trending products</h2>
                <a href="#" className="hidden text-sm font-medium text-indigo-600 hover:text-indigo-500 md:block">
                  Shop the collection
                  <span aria-hidden="true"> &rarr;</span>
                </a>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-4 md:gap-y-0 lg:gap-x-8">
                {trendingProducts.map((product) => (
                  <div key={product.id} className="group relative">
                    <div className="h-56 w-full overflow-hidden rounded-md bg-gray-200 group-hover:opacity-75 lg:h-72 xl:h-80">
                      <img alt={product.imageAlt} src={product.imageSrc} className="size-full object-cover" />
                    </div>
                    <h3 className="mt-4 text-sm text-gray-700">
                      <a href={product.href}>
                        <span className="absolute inset-0" />
                        {product.name}
                      </a>
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">{product.color}</p>
                    <p className="mt-1 text-sm font-medium text-gray-900">{product.price}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="Simple Product Grid">
          <div className="bg-white p-8 rounded-lg">
            <div className="max-w-7xl mx-auto">
              <h2 className="sr-only">Products</h2>
              <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
                {productGrid.map((product) => (
                  <a key={product.id} href={product.href} className="group">
                    <img
                      alt={product.imageAlt}
                      src={product.imageSrc}
                      className="aspect-square w-full rounded-lg bg-gray-200 object-cover group-hover:opacity-75"
                    />
                    <h3 className="mt-4 text-sm text-gray-700">{product.name}</h3>
                    <p className="mt-1 text-lg font-medium text-gray-900">{product.price}</p>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="Product with Color Variants">
          <div className="bg-white p-8 rounded-lg">
            <div className="max-w-7xl mx-auto">
              <div className="lg:grid lg:grid-cols-2 lg:gap-x-8">
                <div className="aspect-square w-full rounded-lg overflow-hidden">
                  <img
                    alt={basicProduct.images[0].imageAlt}
                    src={basicProduct.images[0].imageSrc}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="mt-8 lg:mt-0">
                  <h1 className="text-3xl font-bold text-gray-900">{basicProduct.name}</h1>
                  <p className="text-3xl mt-3 text-gray-900">{basicProduct.price}</p>
                  
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-gray-900">Color</h3>
                    <div className="flex items-center gap-x-3 mt-2">
                      {basicProduct.colors.map((color) => (
                        <div key={color.id} className="flex rounded-full outline -outline-offset-1 outline-black/10">
                          <button
                            className={classNames(
                              color.classes,
                              'size-8 rounded-full border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500'
                            )}
                            aria-label={color.name}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8">
                    <h3 className="text-sm font-medium text-gray-900">Size</h3>
                    <div className="grid grid-cols-5 gap-3 mt-2">
                      {basicProduct.sizes.map((size) => (
                        <button
                          key={size.id}
                          disabled={!size.inStock}
                          className={classNames(
                            size.inStock
                              ? 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
                              : 'bg-gray-50 text-gray-200 cursor-not-allowed',
                            'border rounded-md py-3 px-3 flex items-center justify-center text-sm font-medium uppercase'
                          )}
                        >
                          {size.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button className="mt-8 w-full bg-indigo-600 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Add to bag
                  </button>

                  <div className="mt-6">
                    <p className="text-gray-500">{basicProduct.description}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="Product Card with Overlay Price">
          <div className="bg-white p-8 rounded-lg">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 gap-y-12 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8">
                {relatedProducts.map((product) => (
                  <div key={product.id}>
                    <div className="relative">
                      <div className="relative h-72 w-full overflow-hidden rounded-lg">
                        <img alt={product.imageAlt} src={product.imageSrc} className="size-full object-cover" />
                      </div>
                      <div className="relative mt-4">
                        <h3 className="text-sm font-medium text-gray-900">{product.name}</h3>
                        <p className="mt-1 text-sm text-gray-500">{product.color}</p>
                      </div>
                      <div className="absolute inset-x-0 top-0 flex h-72 items-end justify-end overflow-hidden rounded-lg p-4">
                        <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black opacity-50" />
                        <p className="relative text-lg font-semibold text-white">{product.price}</p>
                      </div>
                    </div>
                    <div className="mt-6">
                      <a
                        href={product.href}
                        className="relative flex items-center justify-center rounded-md border border-transparent bg-gray-100 px-8 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200"
                      >
                        Add to bag
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="Product Card with Ratings">
          <div className="bg-white p-8 rounded-lg">
            <div className="max-w-7xl mx-auto">
              <div className="-mx-px grid grid-cols-2 border-l border-gray-200 sm:mx-0 md:grid-cols-3 lg:grid-cols-4">
                {[
                  { id: 1, name: 'Organize Basic Set', price: '$149', rating: 5, reviewCount: 38, imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/category-page-05-image-card-01.jpg' },
                  { id: 2, name: 'Organize Pen Holder', price: '$15', rating: 5, reviewCount: 18, imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/category-page-05-image-card-02.jpg' },
                  { id: 3, name: 'Organize Sticky Note', price: '$15', rating: 5, reviewCount: 14, imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/category-page-05-image-card-03.jpg' },
                  { id: 4, name: 'Organize Phone Holder', price: '$15', rating: 4, reviewCount: 21, imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/category-page-05-image-card-04.jpg' },
                ].map((product) => (
                  <div key={product.id} className="group relative border-r border-b border-gray-200 p-4 sm:p-6">
                    <img
                      alt=""
                      src={product.imageSrc}
                      className="aspect-square rounded-lg bg-gray-200 object-cover group-hover:opacity-75"
                    />
                    <div className="pt-10 pb-4 text-center">
                      <h3 className="text-sm font-medium text-gray-900">
                        <a href="#">
                          <span aria-hidden="true" className="absolute inset-0" />
                          {product.name}
                        </a>
                      </h3>
                      <div className="mt-3 flex flex-col items-center">
                        <div className="flex items-center">
                          {[0, 1, 2, 3, 4].map((rating) => (
                            <Star
                              key={rating}
                              className={classNames(
                                product.rating > rating ? 'text-yellow-400' : 'text-gray-200',
                                'h-5 w-5'
                              )}
                              fill="currentColor"
                            />
                          ))}
                        </div>
                        <p className="mt-1 text-sm text-gray-500">{product.reviewCount} reviews</p>
                      </div>
                      <p className="mt-4 text-base font-medium text-gray-900">{product.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="Product Card with Description">
          <div className="bg-white p-8 rounded-lg">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-3 lg:gap-x-8">
                {[
                  { id: 1, name: 'Basic Tee 8-Pack', price: '$256', description: 'Get the full lineup of our Basic Tees.', options: '8 colors', imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/category-page-02-image-card-01.jpg' },
                  { id: 2, name: 'Basic Tee', price: '$32', description: 'Look like a visionary CEO.', options: 'Black', imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/category-page-02-image-card-02.jpg' },
                  { id: 3, name: 'White Basic Tee', price: '$32', description: "It's probably 5000 Kelvin.", options: 'White', imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/category-page-02-image-card-03.jpg' },
                ].map((product) => (
                  <div
                    key={product.id}
                    className="group relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white"
                  >
                    <img
                      alt=""
                      src={product.imageSrc}
                      className="aspect-3/4 w-full bg-gray-200 object-cover group-hover:opacity-75 sm:aspect-auto sm:h-96"
                    />
                    <div className="flex flex-1 flex-col space-y-2 p-4">
                      <h3 className="text-sm font-medium text-gray-900">
                        <a href="#">
                          <span aria-hidden="true" className="absolute inset-0" />
                          {product.name}
                        </a>
                      </h3>
                      <p className="text-sm text-gray-500">{product.description}</p>
                      <div className="flex flex-1 flex-col justify-end">
                        <p className="text-sm text-gray-500 italic">{product.options}</p>
                        <p className="text-base font-medium text-gray-900">{product.price}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ShowcaseSection>
      </div>
    </div>
  );
}