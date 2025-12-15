import React from 'react';
import { PageHeader } from '@/components/sturij/PageHeader';
import { ShowcaseSection } from '@/components/showcase/ShowcaseSection';
import { Star, Check, Heart, Minus, Plus, HelpCircle, ChevronDown, Clock, X, Search, ShoppingBag } from 'lucide-react';
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

        <ShowcaseSection title="Category Grid with Overlay Text">
          <div className="bg-gray-50 p-8 rounded-lg">
            <div className="max-w-7xl mx-auto">
              <div className="sm:flex sm:items-baseline sm:justify-between">
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">Shop by Category</h2>
                <a href="#" className="hidden text-sm font-semibold text-indigo-600 hover:text-indigo-500 sm:block">
                  Browse all categories
                  <span aria-hidden="true"> &rarr;</span>
                </a>
              </div>
              <div className="mt-6 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:grid-rows-2 sm:gap-x-6 lg:gap-8">
                <div className="group relative aspect-2/1 overflow-hidden rounded-lg sm:row-span-2 sm:aspect-square">
                  <img
                    alt="Two models wearing women's black cotton crewneck tee."
                    src="https://tailwindcss.com/plus-assets/img/ecommerce-images/home-page-03-featured-category.jpg"
                    className="absolute size-full object-cover group-hover:opacity-75"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-50" />
                  <div className="absolute inset-0 flex items-end p-6">
                    <div>
                      <h3 className="font-semibold text-white">
                        <a href="#">
                          <span className="absolute inset-0" />
                          New Arrivals
                        </a>
                      </h3>
                      <p className="mt-1 text-sm text-white">Shop now</p>
                    </div>
                  </div>
                </div>
                <div className="group relative aspect-2/1 overflow-hidden rounded-lg sm:aspect-auto">
                  <img
                    alt="Accessories collection"
                    src="https://tailwindcss.com/plus-assets/img/ecommerce-images/home-page-03-category-01.jpg"
                    className="absolute size-full object-cover group-hover:opacity-75"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-50" />
                  <div className="absolute inset-0 flex items-end p-6">
                    <div>
                      <h3 className="font-semibold text-white">
                        <a href="#">
                          <span className="absolute inset-0" />
                          Accessories
                        </a>
                      </h3>
                      <p className="mt-1 text-sm text-white">Shop now</p>
                    </div>
                  </div>
                </div>
                <div className="group relative aspect-2/1 overflow-hidden rounded-lg sm:aspect-auto">
                  <img
                    alt="Workspace collection"
                    src="https://tailwindcss.com/plus-assets/img/ecommerce-images/home-page-03-category-02.jpg"
                    className="absolute size-full object-cover group-hover:opacity-75"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-50" />
                  <div className="absolute inset-0 flex items-end p-6">
                    <div>
                      <h3 className="font-semibold text-white">
                        <a href="#">
                          <span className="absolute inset-0" />
                          Workspace
                        </a>
                      </h3>
                      <p className="mt-1 text-sm text-white">Shop now</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="Simple Collections Grid">
          <div className="bg-gray-100 p-8 rounded-lg">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Collections</h2>
              <div className="grid grid-cols-1 gap-y-12 lg:grid-cols-3 lg:gap-x-6">
                {[
                  {
                    name: 'Desk and Office',
                    description: 'Work from home accessories',
                    imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/home-page-02-edition-01.jpg',
                    imageAlt: 'Desk with leather desk pad and accessories.',
                  },
                  {
                    name: 'Self-Improvement',
                    description: 'Journals and note-taking',
                    imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/home-page-02-edition-02.jpg',
                    imageAlt: 'Wood table with journal and pen.',
                  },
                  {
                    name: 'Travel',
                    description: 'Daily commute essentials',
                    imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/home-page-02-edition-03.jpg',
                    imageAlt: 'Collection of travel bottles.',
                  },
                ].map((callout) => (
                  <div key={callout.name} className="group relative">
                    <img
                      alt={callout.imageAlt}
                      src={callout.imageSrc}
                      className="w-full rounded-lg bg-white object-cover group-hover:opacity-75 aspect-2/1 lg:aspect-square"
                    />
                    <h3 className="mt-6 text-sm text-gray-500">
                      <a href="#">
                        <span className="absolute inset-0" />
                        {callout.name}
                      </a>
                    </h3>
                    <p className="text-base font-semibold text-gray-900">{callout.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="Featured Collection with Overlay">
          <div className="bg-white p-8 rounded-lg">
            <div className="max-w-7xl mx-auto">
              <div className="relative overflow-hidden rounded-lg lg:h-96">
                <div className="absolute inset-0">
                  <img
                    alt=""
                    src="https://tailwindcss.com/plus-assets/img/ecommerce-images/category-page-01-featured-collection.jpg"
                    className="size-full object-cover"
                  />
                </div>
                <div className="relative h-96 w-full lg:hidden" />
                <div className="relative h-32 w-full lg:hidden" />
                <div className="absolute inset-x-0 bottom-0 rounded-br-lg rounded-bl-lg bg-black/75 p-6 backdrop-blur-sm sm:flex sm:items-center sm:justify-between lg:inset-x-auto lg:inset-y-0 lg:w-96 lg:flex-col lg:items-start lg:rounded-tl-lg lg:rounded-br-none">
                  <div>
                    <h2 className="text-xl font-bold text-white">Workspace Collection</h2>
                    <p className="mt-1 text-sm text-gray-300">
                      Upgrade your desk with objects that keep you organized.
                    </p>
                  </div>
                  <a
                    href="#"
                    className="mt-6 flex shrink-0 items-center justify-center rounded-md border border-white/25 px-4 py-3 text-base font-medium text-white hover:bg-white/10 sm:mt-0 sm:ml-8 lg:ml-0 lg:w-full"
                  >
                    View the collection
                  </a>
                </div>
              </div>
            </div>
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="Collections with Description">
          <div className="bg-white p-8 rounded-lg">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-2xl font-bold tracking-tight text-gray-900">Shop by Collection</h2>
              <p className="mt-4 text-base text-gray-500">
                Each season, we collaborate with world-class designers to create a collection.
              </p>
              <div className="mt-10 grid grid-cols-1 gap-y-12 lg:grid-cols-3 lg:gap-x-8">
                {[
                  {
                    name: 'Handcrafted Collection',
                    imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/home-page-01-collection-01.jpg',
                    imageAlt: 'Brown leather key ring.',
                    description: 'Keep your phone, keys, and wallet together.',
                  },
                  {
                    name: 'Organized Desk Collection',
                    imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/home-page-01-collection-02.jpg',
                    imageAlt: 'Natural leather mouse pad.',
                    description: 'Your desk will look great.',
                  },
                  {
                    name: 'Focus Collection',
                    imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/home-page-01-collection-03.jpg',
                    imageAlt: 'Task list card holder.',
                    description: 'Be more productive with a single piece of paper.',
                  },
                ].map((category) => (
                  <a key={category.name} href="#" className="group block">
                    <img
                      alt={category.imageAlt}
                      src={category.imageSrc}
                      className="aspect-3/2 w-full rounded-lg object-cover group-hover:opacity-75 lg:aspect-5/6"
                    />
                    <h3 className="mt-4 text-base font-semibold text-gray-900">{category.name}</h3>
                    <p className="mt-2 text-sm text-gray-500">{category.description}</p>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="Horizontal Scroll Categories">
          <div className="bg-white p-8 rounded-lg">
            <div className="max-w-7xl mx-auto">
              <div className="sm:flex sm:items-center sm:justify-between">
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">Shop by Category</h2>
                <a href="#" className="hidden text-sm font-semibold text-indigo-600 hover:text-indigo-500 sm:block">
                  Browse all categories
                  <span aria-hidden="true"> &rarr;</span>
                </a>
              </div>
              <div className="mt-4 flow-root">
                <div className="-my-2">
                  <div className="relative box-content h-80 overflow-x-auto py-2">
                    <div className="flex space-x-8">
                      {[
                        { name: 'New Arrivals', imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/home-page-01-category-01.jpg' },
                        { name: 'Productivity', imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/home-page-01-category-02.jpg' },
                        { name: 'Workspace', imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/home-page-01-category-04.jpg' },
                        { name: 'Accessories', imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/home-page-01-category-05.jpg' },
                        { name: 'Sale', imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/home-page-01-category-03.jpg' },
                      ].map((category) => (
                        <a
                          key={category.name}
                          href="#"
                          className="relative flex h-80 w-56 flex-col overflow-hidden rounded-lg p-6 hover:opacity-75"
                        >
                          <span className="absolute inset-0">
                            <img alt="" src={category.imageSrc} className="size-full object-cover" />
                          </span>
                          <span className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-gray-800 opacity-50" />
                          <span className="relative mt-auto text-center text-xl font-bold text-white">
                            {category.name}
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="Split Screen Categories">
          <div className="bg-gray-50 p-8 rounded-lg">
            <div className="grid grid-cols-1 grid-rows-2 lg:grid-cols-2 lg:grid-rows-1 gap-4">
              <div className="relative flex h-96">
                <img
                  alt=""
                  src="https://tailwindcss.com/plus-assets/img/ecommerce-images/home-page-02-edition-01.jpg"
                  className="absolute inset-0 size-full object-cover rounded-lg"
                />
                <div className="relative flex w-full flex-col items-start justify-end bg-black/40 p-8 rounded-lg">
                  <h2 className="text-lg font-medium text-white/75">Self-Improvement</h2>
                  <p className="mt-1 text-2xl font-medium text-white">Journals and note-taking</p>
                  <a
                    href="#"
                    className="mt-4 rounded-md bg-white px-4 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-50"
                  >
                    Shop now
                  </a>
                </div>
              </div>
              <div className="relative flex h-96">
                <img
                  alt=""
                  src="https://tailwindcss.com/plus-assets/img/ecommerce-images/home-page-02-edition-02.jpg"
                  className="absolute inset-0 size-full object-cover rounded-lg"
                />
                <div className="relative flex w-full flex-col items-start justify-end bg-black/40 p-8 rounded-lg">
                  <h2 className="text-lg font-medium text-white/75">Desk and Office</h2>
                  <p className="mt-1 text-2xl font-medium text-white">Work from home accessories</p>
                  <a
                    href="#"
                    className="mt-4 rounded-md bg-white px-4 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-50"
                  >
                    Shop now
                  </a>
                </div>
              </div>
            </div>
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="Shopping Cart - Two Column Layout">
          <div className="bg-white p-8 rounded-lg">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Shopping Cart</h1>
              <div className="mt-12 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16">
                <section className="lg:col-span-7">
                  <ul className="divide-y divide-gray-200 border-t border-b border-gray-200">
                    {relatedProducts.slice(0, 3).map((product, idx) => (
                      <li key={product.id} className="flex py-6 sm:py-10">
                        <div className="shrink-0">
                          <img
                            alt={product.imageAlt}
                            src={product.imageSrc}
                            className="size-24 rounded-md object-cover sm:size-48"
                          />
                        </div>
                        <div className="ml-4 flex flex-1 flex-col justify-between sm:ml-6">
                          <div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
                            <div>
                              <div className="flex justify-between">
                                <h3 className="text-sm">
                                  <a href={product.href} className="font-medium text-gray-700 hover:text-gray-800">
                                    {product.name}
                                  </a>
                                </h3>
                              </div>
                              <div className="mt-1 flex text-sm">
                                <p className="text-gray-500">{product.color}</p>
                                <p className="ml-4 border-l border-gray-200 pl-4 text-gray-500">Large</p>
                              </div>
                              <p className="mt-1 text-sm font-medium text-gray-900">{product.price}</p>
                            </div>
                            <div className="mt-4 sm:mt-0 sm:pr-9">
                              <select className="max-w-full rounded-md border border-gray-300 py-1.5 text-left text-base font-medium text-gray-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm">
                                <option value={1}>1</option>
                                <option value={2}>2</option>
                                <option value={3}>3</option>
                              </select>
                              <div className="absolute top-0 right-0">
                                <button type="button" className="-m-2 inline-flex p-2 text-gray-400 hover:text-gray-500">
                                  <X className="h-5 w-5" />
                                </button>
                              </div>
                            </div>
                          </div>
                          <p className="mt-4 flex space-x-2 text-sm text-gray-700">
                            <Check className="h-5 w-5 text-green-500" />
                            <span>In stock</span>
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="mt-16 rounded-lg bg-gray-50 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8">
                  <h2 className="text-lg font-medium text-gray-900">Order summary</h2>
                  <dl className="mt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <dt className="text-sm text-gray-600">Subtotal</dt>
                      <dd className="text-sm font-medium text-gray-900">$99.00</dd>
                    </div>
                    <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                      <dt className="text-sm text-gray-600">Shipping estimate</dt>
                      <dd className="text-sm font-medium text-gray-900">$5.00</dd>
                    </div>
                    <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                      <dt className="text-sm text-gray-600">Tax estimate</dt>
                      <dd className="text-sm font-medium text-gray-900">$8.32</dd>
                    </div>
                    <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                      <dt className="text-base font-medium text-gray-900">Order total</dt>
                      <dd className="text-base font-medium text-gray-900">$112.32</dd>
                    </div>
                  </dl>
                  <div className="mt-6">
                    <button className="w-full rounded-md border border-transparent bg-indigo-600 px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700">
                      Checkout
                    </button>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="Shopping Cart - Centered Layout">
          <div className="bg-white p-8 rounded-lg">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-center text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Shopping Cart</h1>
              <div className="mt-12">
                <ul className="divide-y divide-gray-200 border-t border-b border-gray-200">
                  {relatedProducts.slice(0, 3).map((product) => (
                    <li key={product.id} className="flex py-6 sm:py-10">
                      <div className="shrink-0">
                        <img
                          alt={product.imageAlt}
                          src={product.imageSrc}
                          className="size-24 rounded-lg object-cover sm:size-32"
                        />
                      </div>
                      <div className="relative ml-4 flex flex-1 flex-col justify-between sm:ml-6">
                        <div>
                          <div className="flex justify-between sm:grid sm:grid-cols-2">
                            <div className="pr-6">
                              <h3 className="text-sm">
                                <a href={product.href} className="font-medium text-gray-700 hover:text-gray-800">
                                  {product.name}
                                </a>
                              </h3>
                              <p className="mt-1 text-sm text-gray-500">{product.color}</p>
                            </div>
                            <p className="text-right text-sm font-medium text-gray-900">{product.price}</p>
                          </div>
                          <div className="mt-4 flex items-center">
                            <select className="rounded-md border border-gray-300 text-left text-base font-medium text-gray-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm">
                              <option value={1}>1</option>
                              <option value={2}>2</option>
                              <option value={3}>3</option>
                            </select>
                            <button type="button" className="ml-4 text-sm font-medium text-indigo-600 hover:text-indigo-500">
                              Remove
                            </button>
                          </div>
                        </div>
                        <p className="mt-4 flex space-x-2 text-sm text-gray-700">
                          <Check className="h-5 w-5 text-green-500" />
                          <span>In stock</span>
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="mt-10 sm:ml-32 sm:pl-6">
                  <div className="rounded-lg bg-gray-50 px-4 py-6 sm:p-6 lg:p-8">
                    <div className="flow-root">
                      <dl className="-my-4 divide-y divide-gray-200 text-sm">
                        <div className="flex items-center justify-between py-4">
                          <dt className="text-gray-600">Subtotal</dt>
                          <dd className="font-medium text-gray-900">$99.00</dd>
                        </div>
                        <div className="flex items-center justify-between py-4">
                          <dt className="text-gray-600">Shipping</dt>
                          <dd className="font-medium text-gray-900">$5.00</dd>
                        </div>
                        <div className="flex items-center justify-between py-4">
                          <dt className="text-gray-600">Tax</dt>
                          <dd className="font-medium text-gray-900">$8.32</dd>
                        </div>
                        <div className="flex items-center justify-between py-4">
                          <dt className="text-base font-medium text-gray-900">Order total</dt>
                          <dd className="text-base font-medium text-gray-900">$112.32</dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                  <div className="mt-10">
                    <button className="w-full rounded-md border border-transparent bg-indigo-600 px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700">
                      Checkout
                    </button>
                  </div>
                  <div className="mt-6 text-center text-sm text-gray-500">
                    <p>
                      or{' '}
                      <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                        Continue Shopping
                        <span aria-hidden="true"> &rarr;</span>
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ShowcaseSection>
      </div>
    </div>
  );
}