import React from 'react';
import { PageHeader } from '@/components/sturij/PageHeader';
import { ShowcaseSection } from '@/components/showcase/ShowcaseSection';
import { Star, Check, Heart, Minus, Plus, HelpCircle, ChevronDown, Clock, X, Search, ShoppingBag, ShieldCheck, CheckCircle } from 'lucide-react';
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

        <ShowcaseSection title="Product Filters - Horizontal Dropdown">
          <div className="bg-gray-50 p-8 rounded-lg">
            <div className="max-w-7xl mx-auto">
              <div className="py-12 text-center">
                <h1 className="text-4xl font-bold tracking-tight text-gray-900">New Arrivals</h1>
                <p className="mx-auto mt-4 max-w-3xl text-base text-gray-500">
                  Thoughtfully designed objects for the workspace, home, and travel.
                </p>
              </div>
              <div className="border-t border-gray-200 py-6">
                <div className="flex items-center justify-between">
                  <button className="group inline-flex justify-center text-sm font-medium text-gray-700 hover:text-gray-900">
                    Sort
                    <ChevronDown className="-mr-1 ml-1 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                  </button>
                  <div className="flex items-baseline space-x-8">
                    <button className="group inline-flex items-center justify-center text-sm font-medium text-gray-700 hover:text-gray-900">
                      Category
                      <ChevronDown className="-mr-1 ml-1 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                    </button>
                    <button className="group inline-flex items-center justify-center text-sm font-medium text-gray-700 hover:text-gray-900">
                      Brand
                      <ChevronDown className="-mr-1 ml-1 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                    </button>
                    <button className="group inline-flex items-center justify-center text-sm font-medium text-gray-700 hover:text-gray-900">
                      Color
                      <ChevronDown className="-mr-1 ml-1 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="Product Filters - With Active Filters">
          <div className="bg-white p-8 rounded-lg">
            <div className="max-w-7xl mx-auto">
              <div className="py-8">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Workspace sale</h1>
                <p className="mt-4 max-w-xl text-sm text-gray-700">
                  Our thoughtfully designed workspace objects are crafted in limited runs.
                </p>
              </div>
              <div className="border-b border-gray-200 bg-white pb-4">
                <div className="flex items-center justify-between">
                  <button className="group inline-flex justify-center text-sm font-medium text-gray-700 hover:text-gray-900">
                    Sort
                    <ChevronDown className="-mr-1 ml-1 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                  </button>
                  <div className="flex items-center divide-x divide-gray-200">
                    <button className="px-4 inline-flex justify-center text-sm font-medium text-gray-700 hover:text-gray-900">
                      <span>Category</span>
                      <span className="ml-1.5 rounded-sm bg-gray-200 px-1.5 py-0.5 text-xs font-semibold text-gray-700">1</span>
                      <ChevronDown className="-mr-1 ml-1 h-5 w-5 text-gray-400" />
                    </button>
                    <button className="px-4 inline-flex justify-center text-sm font-medium text-gray-700 hover:text-gray-900">
                      <span>Color</span>
                      <ChevronDown className="-mr-1 ml-1 h-5 w-5 text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="bg-gray-100 rounded-lg mt-4">
                <div className="py-3 px-4 flex items-center">
                  <h3 className="text-sm font-medium text-gray-500">Filters</h3>
                  <div className="ml-4 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center rounded-full border border-gray-200 bg-white py-1.5 pr-2 pl-3 text-sm font-medium text-gray-900">
                      <span>Objects</span>
                      <button className="ml-1 inline-flex h-4 w-4 shrink-0 rounded-full p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-500">
                        <X className="h-2 w-2" />
                      </button>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="Product Filters - Collapsible Full Width">
          <div className="bg-white p-8 rounded-lg">
            <div className="max-w-7xl mx-auto">
              <div className="px-4 py-8 text-center">
                <h1 className="text-4xl font-bold tracking-tight text-gray-900">Workspace</h1>
                <p className="mx-auto mt-4 max-w-xl text-base text-gray-500">
                  The secret to a tidy desk? Really nice looking containers.
                </p>
              </div>
              <div className="border-t border-b border-gray-200 py-4">
                <div className="flex items-center justify-between px-4">
                  <button className="flex items-center font-medium text-gray-700">
                    <Search className="mr-2 h-5 w-5 text-gray-400" />
                    2 Filters
                  </button>
                  <button className="text-gray-500">Clear all</button>
                </div>
              </div>
              <div className="bg-gray-50 border-t border-gray-200 py-10 rounded-lg mt-4">
                <div className="grid grid-cols-2 gap-x-4 px-4 text-sm">
                  <div>
                    <fieldset>
                      <legend className="block font-medium mb-4">Price</legend>
                      <div className="space-y-3">
                        <label className="flex items-center gap-3">
                          <input type="checkbox" className="rounded border-gray-300" />
                          <span className="text-gray-600">$0 - $25</span>
                        </label>
                        <label className="flex items-center gap-3">
                          <input type="checkbox" className="rounded border-gray-300" />
                          <span className="text-gray-600">$25 - $50</span>
                        </label>
                      </div>
                    </fieldset>
                  </div>
                  <div>
                    <fieldset>
                      <legend className="block font-medium mb-4">Color</legend>
                      <div className="space-y-3">
                        <label className="flex items-center gap-3">
                          <input type="checkbox" className="rounded border-gray-300" />
                          <span className="text-gray-600">White</span>
                        </label>
                        <label className="flex items-center gap-3">
                          <input type="checkbox" className="rounded border-gray-300" />
                          <span className="text-gray-600">Blue</span>
                        </label>
                      </div>
                    </fieldset>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="Product Filters - Sidebar with Categories">
          <div className="bg-white p-8 rounded-lg">
            <div className="max-w-7xl mx-auto">
              <div className="border-b border-gray-200 pb-6 mb-6">
                <h1 className="text-4xl font-bold tracking-tight text-gray-900">New Arrivals</h1>
                <div className="mt-4 flex items-center justify-end">
                  <button className="group inline-flex justify-center text-sm font-medium text-gray-700 hover:text-gray-900">
                    Sort
                    <ChevronDown className="-mr-1 ml-1 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-4">
                <div className="hidden lg:block">
                  <h3 className="sr-only">Categories</h3>
                  <ul className="space-y-4 border-b border-gray-200 pb-6 text-sm font-medium text-gray-900">
                    <li><a href="#">Totes</a></li>
                    <li><a href="#">Backpacks</a></li>
                    <li><a href="#">Travel Bags</a></li>
                    <li><a href="#">Hip Bags</a></li>
                  </ul>
                  <div className="border-b border-gray-200 py-6">
                    <h3 className="font-medium text-gray-900 mb-4">Color</h3>
                    <div className="space-y-4">
                      <label className="flex items-center gap-3">
                        <input type="checkbox" className="rounded border-gray-300" />
                        <span className="text-sm text-gray-600">White</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input type="checkbox" checked className="rounded border-gray-300" />
                        <span className="text-sm text-gray-600">Blue</span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="lg:col-span-3">
                  <div className="text-center text-gray-500 py-12">Product Grid Goes Here</div>
                </div>
              </div>
            </div>
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="Product Filters - Simple Sidebar">
          <div className="bg-white p-8 rounded-lg">
            <div className="max-w-7xl mx-auto">
              <div className="border-b border-gray-200 pb-10">
                <h1 className="text-4xl font-bold tracking-tight text-gray-900">New Arrivals</h1>
                <p className="mt-4 text-base text-gray-500">
                  Checkout out the latest release of Basic Tees, new and improved with four openings!
                </p>
              </div>
              <div className="pt-12 grid grid-cols-1 gap-x-8 lg:grid-cols-3 xl:grid-cols-4">
                <aside className="hidden lg:block">
                  <div className="divide-y divide-gray-200">
                    <div className="py-6">
                      <h3 className="block text-sm font-medium text-gray-900 mb-6">Color</h3>
                      <div className="space-y-3">
                        <label className="flex items-center gap-3">
                          <input type="checkbox" className="rounded border-gray-300" />
                          <span className="text-sm text-gray-600">White</span>
                        </label>
                        <label className="flex items-center gap-3">
                          <input type="checkbox" className="rounded border-gray-300" />
                          <span className="text-sm text-gray-600">Beige</span>
                        </label>
                        <label className="flex items-center gap-3">
                          <input type="checkbox" className="rounded border-gray-300" />
                          <span className="text-sm text-gray-600">Blue</span>
                        </label>
                      </div>
                    </div>
                    <div className="py-6">
                      <h3 className="block text-sm font-medium text-gray-900 mb-6">Category</h3>
                      <div className="space-y-3">
                        <label className="flex items-center gap-3">
                          <input type="checkbox" className="rounded border-gray-300" />
                          <span className="text-sm text-gray-600">All New Arrivals</span>
                        </label>
                        <label className="flex items-center gap-3">
                          <input type="checkbox" className="rounded border-gray-300" />
                          <span className="text-sm text-gray-600">Tees</span>
                        </label>
                        <label className="flex items-center gap-3">
                          <input type="checkbox" className="rounded border-gray-300" />
                          <span className="text-sm text-gray-600">Crewnecks</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </aside>
                <div className="lg:col-span-2 xl:col-span-3">
                  <div className="text-center text-gray-500 py-12">Product Grid Goes Here</div>
                </div>
              </div>
            </div>
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="Quick View Modal - Compact">
          <div className="bg-gray-100 p-8 rounded-lg">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-2xl p-6 lg:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 lg:gap-8">
                <img
                  src="https://tailwindcss.com/plus-assets/img/ecommerce-images/product-page-01-featured-product-shot.jpg"
                  className="aspect-2/3 w-full rounded-lg object-cover sm:col-span-4 lg:col-span-5"
                  alt="Product"
                />
                <div className="sm:col-span-8 lg:col-span-7">
                  <h2 className="text-xl font-medium text-gray-900">Women's Basic Tee</h2>
                  <p className="mt-1 font-medium text-gray-900">$32</p>
                  <div className="mt-4 flex items-center">
                    <div className="flex items-center">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <Star key={i} className={`h-5 w-5 ${i < 3 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                      ))}
                    </div>
                    <p className="ml-2 text-sm text-gray-700">3.9</p>
                    <a href="#" className="ml-4 text-sm font-medium text-indigo-600 hover:text-indigo-500">512 reviews</a>
                  </div>
                  <div className="mt-8">
                    <h3 className="text-sm font-medium text-gray-900">Color</h3>
                    <div className="mt-2 flex items-center gap-3">
                      <button className="h-8 w-8 rounded-full bg-gray-900 ring-2 ring-gray-900 ring-offset-2" />
                      <button className="h-8 w-8 rounded-full bg-gray-400 ring-1 ring-black/10" />
                    </div>
                  </div>
                  <div className="mt-8">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900">Size</h3>
                      <a href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">Size guide</a>
                    </div>
                    <div className="mt-2 grid grid-cols-4 gap-3">
                      {['XXS', 'XS', 'S', 'M', 'L', 'XL'].map((size) => (
                        <button
                          key={size}
                          className="border border-gray-300 rounded-md py-3 text-sm font-medium text-gray-900 hover:bg-gray-50"
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button className="mt-8 w-full rounded-md bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700">
                    Add to bag
                  </button>
                  <p className="mt-6 text-center">
                    <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">View full details</a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="Quick View Modal - Large">
          <div className="bg-gray-100 p-8 rounded-lg">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-2xl p-6 lg:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 lg:gap-8">
                <img
                  src="https://tailwindcss.com/plus-assets/img/ecommerce-images/product-quick-preview-02-detail.jpg"
                  className="aspect-2/3 w-full rounded-lg object-cover sm:col-span-4 lg:col-span-5"
                  alt="Product"
                />
                <div className="sm:col-span-8 lg:col-span-7">
                  <h2 className="text-2xl font-bold text-gray-900">Basic Tee 6-Pack</h2>
                  <p className="mt-2 text-2xl text-gray-900">$192</p>
                  <div className="mt-6 flex items-center">
                    <div className="flex items-center">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <Star key={i} className={`h-5 w-5 ${i < 3 ? 'fill-gray-900 text-gray-900' : 'text-gray-200'}`} />
                      ))}
                    </div>
                    <a href="#" className="ml-3 text-sm font-medium text-indigo-600 hover:text-indigo-500">117 reviews</a>
                  </div>
                  <div className="mt-10">
                    <h3 className="text-sm font-medium text-gray-900">Color</h3>
                    <div className="mt-4 flex items-center gap-3">
                      <button className="h-8 w-8 rounded-full bg-white ring-2 ring-gray-400 ring-offset-2" />
                      <button className="h-8 w-8 rounded-full bg-gray-200 ring-1 ring-black/10" />
                      <button className="h-8 w-8 rounded-full bg-gray-900 ring-1 ring-black/10" />
                    </div>
                  </div>
                  <div className="mt-10">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900">Size</h3>
                      <a href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">Size guide</a>
                    </div>
                    <div className="mt-2 grid grid-cols-4 gap-3">
                      {['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'].map((size) => (
                        <button
                          key={size}
                          className="border border-gray-300 rounded-md py-3 text-sm font-medium text-gray-900 hover:bg-gray-50 uppercase"
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button className="mt-6 w-full rounded-md bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700">
                    Add to bag
                  </button>
                </div>
              </div>
            </div>
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="Quick View Modal - With Descriptions">
          <div className="bg-gray-100 p-8 rounded-lg">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-2xl p-6 lg:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 lg:gap-8">
                <div className="sm:col-span-4 lg:col-span-5">
                  <img
                    src="https://tailwindcss.com/plus-assets/img/ecommerce-images/product-quick-preview-03-detail.jpg"
                    className="aspect-square w-full rounded-lg object-cover"
                    alt="Product"
                  />
                  <p className="mt-6 text-center">
                    <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">View full details</a>
                  </p>
                </div>
                <div className="sm:col-span-8 lg:col-span-7">
                  <h2 className="text-2xl font-bold text-gray-900">Everyday Ruck Snack</h2>
                  <div className="mt-4 flex items-center">
                    <p className="text-lg text-gray-900 sm:text-xl">$220</p>
                    <div className="ml-4 border-l border-gray-300 pl-4">
                      <div className="flex items-center">
                        {[0, 1, 2, 3, 4].map((i) => (
                          <Star key={i} className={`h-5 w-5 ${i < 3 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 flex items-center">
                    <Check className="h-5 w-5 text-green-500" />
                    <p className="ml-2 font-medium text-gray-500">In stock and ready to ship</p>
                  </div>
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-gray-700">Size</h3>
                    <div className="mt-2 space-y-4">
                      <label className="relative flex rounded-lg border border-gray-300 p-4 cursor-pointer hover:border-indigo-600">
                        <input type="radio" name="size" className="sr-only" defaultChecked />
                        <div className="flex-1">
                          <span className="block text-base font-medium text-gray-900">18L</span>
                          <span className="mt-1 block text-sm text-gray-500">Perfect for a reasonable amount of snacks.</span>
                        </div>
                        <CheckCircle className="h-5 w-5 text-indigo-600" />
                      </label>
                      <label className="relative flex rounded-lg border border-gray-300 p-4 cursor-pointer hover:border-indigo-600">
                        <input type="radio" name="size" className="sr-only" />
                        <div className="flex-1">
                          <span className="block text-base font-medium text-gray-900">20L</span>
                          <span className="mt-1 block text-sm text-gray-500">Enough room for a large amount of snacks.</span>
                        </div>
                        <CheckCircle className="h-5 w-5 text-indigo-600 invisible" />
                      </label>
                    </div>
                  </div>
                  <div className="mt-4 flex">
                    <a href="#" className="group flex text-sm text-gray-500 hover:text-gray-700">
                      <span>What size should I buy?</span>
                      <HelpCircle className="ml-2 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                    </a>
                  </div>
                  <button className="mt-6 w-full rounded-md bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700">
                    Add to bag
                  </button>
                  <div className="mt-6 text-center">
                    <a href="#" className="group inline-flex text-base font-medium">
                      <ShieldCheck className="mr-2 h-6 w-6 text-gray-400 group-hover:text-gray-500" />
                      <span className="text-gray-500 group-hover:text-gray-700">Lifetime Guarantee</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="Quick View Modal - With Description Text">
          <div className="bg-gray-100 p-8 rounded-lg">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-2xl p-6 lg:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 lg:gap-8">
                <div className="sm:col-span-4 lg:col-span-5">
                  <img
                    src="https://tailwindcss.com/plus-assets/img/ecommerce-images/product-page-03-product-04.jpg"
                    className="aspect-square w-full rounded-lg object-cover"
                    alt="Product"
                  />
                </div>
                <div className="sm:col-span-8 lg:col-span-7">
                  <h2 className="text-2xl font-bold text-gray-900">Zip Tote Basket</h2>
                  <p className="mt-3 text-2xl text-gray-900">$220</p>
                  <div className="mt-3 flex items-center">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <Star key={i} className={`h-5 w-5 ${i < 3 ? 'fill-gray-400 text-gray-400' : 'text-gray-200'}`} />
                    ))}
                  </div>
                  <div className="mt-6">
                    <p className="text-sm text-gray-700">
                      The Zip Tote Basket is the perfect midpoint between shopping tote and comfy backpack. 
                      With convertible straps, you can hand carry, should sling, or backpack this convenient and spacious bag.
                    </p>
                  </div>
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-600">Color</h4>
                    <div className="mt-2 flex items-center gap-3">
                      <button className="h-8 w-8 rounded-full bg-gray-700 ring-2 ring-gray-700 ring-offset-2" />
                      <button className="h-8 w-8 rounded-full bg-white ring-1 ring-black/10" />
                      <button className="h-8 w-8 rounded-full bg-gray-500 ring-1 ring-black/10" />
                    </div>
                  </div>
                  <button className="mt-6 w-full rounded-md bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700">
                    Add to bag
                  </button>
                  <p className="mt-6 text-center">
                    <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">View full details</a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="Product Details - Two Column">
          <div className="bg-gray-50 p-8 rounded-lg">
            <div className="max-w-7xl mx-auto">
              <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">The Fine Details</h2>
                <p className="mt-3 max-w-3xl mx-auto text-lg text-gray-600">
                  Our patented padded snack sleeve construction protects your favorite treats from getting smooshed.
                </p>
              </div>
              <div className="mt-16 grid grid-cols-1 gap-y-16 lg:grid-cols-2 lg:gap-x-8">
                <div>
                  <img
                    src="https://tailwindcss.com/plus-assets/img/ecommerce-images/product-page-04-detail-product-shot-01.jpg"
                    className="aspect-3/2 w-full rounded-lg object-cover"
                    alt="Detail 1"
                  />
                  <p className="mt-8 text-base text-gray-500">
                    The 20L model has enough space for 370 candy bars, 6 cylinders of chips, 1220 standard gumballs, 
                    or any combination of on-the-go treats that your heart desires.
                  </p>
                </div>
                <div>
                  <img
                    src="https://tailwindcss.com/plus-assets/img/ecommerce-images/product-page-04-detail-product-shot-02.jpg"
                    className="aspect-3/2 w-full rounded-lg object-cover"
                    alt="Detail 2"
                  />
                  <p className="mt-8 text-base text-gray-500">
                    Up your snack organization game with multiple compartment options. The quick-access stash pouch 
                    is ready for even the most unexpected snack attacks.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="Product Features - Full Width Hero">
          <div className="bg-white rounded-lg overflow-hidden">
            <div className="relative">
              <img
                src="https://tailwindcss.com/plus-assets/img/ecommerce-images/product-feature-02-full-width.jpg"
                className="h-96 w-full object-cover"
                alt="Hero"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white" />
            </div>
            <div className="relative -mt-12 max-w-7xl mx-auto px-8 pb-16">
              <div className="max-w-2xl mx-auto text-center lg:max-w-4xl">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Technical Specifications</h2>
                <p className="mt-4 text-gray-500">
                  Organize is a system to keep your desk tidy and photo-worthy all day long.
                </p>
              </div>
              <dl className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-none mx-auto">
                <div className="border-t border-gray-200 pt-4">
                  <dt className="font-medium text-gray-900">Origin</dt>
                  <dd className="mt-2 text-sm text-gray-500">Designed by Good Goods, Inc.</dd>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <dt className="font-medium text-gray-900">Material</dt>
                  <dd className="mt-2 text-sm text-gray-500">Solid walnut base with rare earth magnets</dd>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <dt className="font-medium text-gray-900">Dimensions</dt>
                  <dd className="mt-2 text-sm text-gray-500">15" x 3.75" x .75"</dd>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <dt className="font-medium text-gray-900">Finish</dt>
                  <dd className="mt-2 text-sm text-gray-500">Hand sanded and finished with natural oil</dd>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <dt className="font-medium text-gray-900">Includes</dt>
                  <dd className="mt-2 text-sm text-gray-500">Pen Tray, Phone Tray, Small Tray, Large Tray</dd>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <dt className="font-medium text-gray-900">Considerations</dt>
                  <dd className="mt-2 text-sm text-gray-500">Made from natural materials. Grain and color vary.</dd>
                </div>
              </dl>
            </div>
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="Product Features - Side by Side with Grid">
          <div className="bg-white p-8 rounded-lg">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Technical Specifications</h2>
                <p className="mt-4 text-gray-500">
                  The walnut wood card tray is precision milled to perfectly fit a stack of Focus cards.
                </p>
                <dl className="mt-16 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-10">
                  <div className="border-t border-gray-200 pt-4">
                    <dt className="font-medium text-gray-900">Origin</dt>
                    <dd className="mt-2 text-sm text-gray-500">Designed by Good Goods, Inc.</dd>
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <dt className="font-medium text-gray-900">Material</dt>
                    <dd className="mt-2 text-sm text-gray-500">Solid walnut base</dd>
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <dt className="font-medium text-gray-900">Dimensions</dt>
                    <dd className="mt-2 text-sm text-gray-500">6.25" x 3.55" x 1.15"</dd>
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <dt className="font-medium text-gray-900">Finish</dt>
                    <dd className="mt-2 text-sm text-gray-500">Hand sanded and finished</dd>
                  </div>
                </dl>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <img
                  src="https://tailwindcss.com/plus-assets/img/ecommerce-images/product-feature-03-detail-01.jpg"
                  className="rounded-lg bg-gray-100"
                  alt="Detail 1"
                />
                <img
                  src="https://tailwindcss.com/plus-assets/img/ecommerce-images/product-feature-03-detail-02.jpg"
                  className="rounded-lg bg-gray-100"
                  alt="Detail 2"
                />
                <img
                  src="https://tailwindcss.com/plus-assets/img/ecommerce-images/product-feature-03-detail-03.jpg"
                  className="rounded-lg bg-gray-100"
                  alt="Detail 3"
                />
                <img
                  src="https://tailwindcss.com/plus-assets/img/ecommerce-images/product-feature-03-detail-04.jpg"
                  className="rounded-lg bg-gray-100"
                  alt="Detail 4"
                />
              </div>
            </div>
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="Product Features - Stacked Sections">
          <div className="bg-white p-8 rounded-lg">
            <div className="max-w-7xl mx-auto">
              <div className="max-w-3xl">
                <h2 className="font-semibold text-gray-500">Drawstring Canister</h2>
                <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Use it your way</p>
                <p className="mt-4 text-gray-500">
                  The Drawstring Canister comes with multiple strap and handle options to adapt throughout your day.
                </p>
              </div>
              <div className="mt-10 space-y-16 border-t border-gray-200 pt-10">
                <div className="flex flex-col-reverse lg:grid lg:grid-cols-12 lg:items-center lg:gap-x-8">
                  <div className="mt-6 lg:col-span-5 lg:mt-0">
                    <h3 className="text-lg font-medium text-gray-900">Adventure-ready</h3>
                    <p className="mt-2 text-sm text-gray-500">
                      The Drawstring Canister is water and tear resistant with durable canvas construction.
                    </p>
                  </div>
                  <div className="lg:col-span-7">
                    <img
                      src="https://tailwindcss.com/plus-assets/img/ecommerce-images/product-feature-04-detail-03.jpg"
                      className="aspect-5/2 w-full rounded-lg object-cover"
                      alt="Feature"
                    />
                  </div>
                </div>
                <div className="flex flex-col-reverse lg:grid lg:grid-cols-12 lg:items-center lg:gap-x-8">
                  <div className="mt-6 lg:col-span-5 lg:mt-0">
                    <h3 className="text-lg font-medium text-gray-900">Minimal and clean</h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Everything you need, nothing you don't. Simple, contemporary design.
                    </p>
                  </div>
                  <div className="lg:col-span-7">
                    <img
                      src="https://tailwindcss.com/plus-assets/img/ecommerce-images/product-feature-04-detail-01.jpg"
                      className="aspect-5/2 w-full rounded-lg object-cover"
                      alt="Feature"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="Product Features - Split Image Layout">
          <div className="bg-white p-8 rounded-lg">
            <div className="max-w-7xl mx-auto">
              <div className="max-w-3xl">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Protect your device</h2>
                <p className="mt-4 text-gray-500">
                  Keep your device safe with a fabric sleeve that matches in quality and looks.
                </p>
              </div>
              <div className="mt-16 space-y-16">
                <div className="flex flex-col-reverse lg:grid lg:grid-cols-12 lg:items-center lg:gap-x-8">
                  <div className="mt-6 lg:col-start-1 lg:col-span-5 lg:mt-0">
                    <h3 className="text-lg font-medium text-gray-900">Minimal and thoughtful</h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Our laptop sleeve is compact and precisely fits 13" devices. The zipper allows easy access.
                    </p>
                  </div>
                  <div className="lg:col-start-6 lg:col-span-7">
                    <img
                      src="https://tailwindcss.com/plus-assets/img/ecommerce-images/product-feature-07-detail-01.jpg"
                      className="aspect-5/2 w-full rounded-lg object-cover"
                      alt="Feature"
                    />
                  </div>
                </div>
                <div className="flex flex-col-reverse lg:grid lg:grid-cols-12 lg:items-center lg:gap-x-8">
                  <div className="mt-6 lg:col-start-8 lg:col-span-5 lg:mt-0">
                    <h3 className="text-lg font-medium text-gray-900">Refined details</h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Durable canvas with double-stitched construction, a felt interior, and high quality zipper.
                    </p>
                  </div>
                  <div className="lg:col-start-1 lg:col-span-7">
                    <img
                      src="https://tailwindcss.com/plus-assets/img/ecommerce-images/product-feature-07-detail-02.jpg"
                      className="aspect-5/2 w-full rounded-lg object-cover"
                      alt="Feature"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="Product Features - Side Image with Hero">
          <div className="bg-white rounded-lg overflow-hidden">
            <div className="relative">
              <img
                src="https://tailwindcss.com/plus-assets/img/ecommerce-images/confirmation-page-01-hero.jpg"
                className="aspect-3/2 w-full object-cover sm:aspect-5/2 lg:hidden"
                alt="Hero"
              />
              <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 max-w-7xl mx-auto">
                <img
                  src="https://tailwindcss.com/plus-assets/img/ecommerce-images/confirmation-page-01-hero.jpg"
                  className="hidden lg:block aspect-auto h-full w-full object-cover"
                  alt="Hero"
                />
                <div className="px-6 py-16 lg:py-32">
                  <h2 className="font-medium text-gray-500">Leatherbound Daily Journal</h2>
                  <p className="mt-4 text-4xl font-bold tracking-tight text-gray-900">All in the Details</p>
                  <p className="mt-4 text-gray-500">
                    We've obsessed over every detail of this handcrafted journal to bring you the best materials.
                  </p>
                  <dl className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-10 text-sm">
                    <div>
                      <dt className="font-medium text-gray-900">Durable</dt>
                      <dd className="mt-2 text-gray-500">The leather cover and steel binding stand up to daily use.</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-900">Refillable</dt>
                      <dd className="mt-2 text-gray-500">Buy it once and refill as often as you need.</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-900">Thoughtfully designed</dt>
                      <dd className="mt-2 text-gray-500">Comfortable disc binding allows quick rearrangement.</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-900">Locally made</dt>
                      <dd className="mt-2 text-gray-500">Responsibly and sustainably made close to you.</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="Product Features - Tabbed Interface">
          <div className="bg-white p-8 rounded-lg">
            <div className="max-w-7xl mx-auto">
              <div className="max-w-3xl">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Technical Specifications</h2>
                <p className="mt-4 text-gray-500">
                  The Organize modular system offers endless options for arranging your favorite items.
                </p>
              </div>
              <Tabs defaultValue="design" className="mt-8">
                <TabsList className="border-b border-gray-200 bg-transparent p-0 h-auto">
                  <TabsTrigger value="design" className="border-b-2 border-transparent data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-600 text-gray-500 hover:text-gray-700 rounded-none py-4 px-1 mr-10">
                    Design
                  </TabsTrigger>
                  <TabsTrigger value="material" className="border-b-2 border-transparent data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-600 text-gray-500 hover:text-gray-700 rounded-none py-4 px-1 mr-10">
                    Material
                  </TabsTrigger>
                  <TabsTrigger value="considerations" className="border-b-2 border-transparent data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-600 text-gray-500 hover:text-gray-700 rounded-none py-4 px-1 mr-10">
                    Considerations
                  </TabsTrigger>
                  <TabsTrigger value="included" className="border-b-2 border-transparent data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-600 text-gray-500 hover:text-gray-700 rounded-none py-4 px-1">
                    Included
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="design" className="pt-10">
                  <div className="flex flex-col-reverse lg:grid lg:grid-cols-12 lg:gap-x-8">
                    <div className="mt-6 lg:col-span-5 lg:mt-0">
                      <h3 className="text-lg font-medium text-gray-900">Adaptive and modular</h3>
                      <p className="mt-2 text-sm text-gray-500">
                        The Organize base set allows you to configure and evolve your setup as your items change.
                      </p>
                    </div>
                    <div className="lg:col-span-7">
                      <img
                        src="https://tailwindcss.com/plus-assets/img/ecommerce-images/product-feature-06-detail-01.jpg"
                        className="aspect-5/2 w-full rounded-lg object-cover"
                        alt="Design"
                      />
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="material" className="pt-10">
                  <div className="flex flex-col-reverse lg:grid lg:grid-cols-12 lg:gap-x-8">
                    <div className="mt-6 lg:col-span-5 lg:mt-0">
                      <h3 className="text-lg font-medium text-gray-900">Natural wood options</h3>
                      <p className="mt-2 text-sm text-gray-500">
                        Options for rich walnut and bright maple base materials. Every base is hand sanded.
                      </p>
                    </div>
                    <div className="lg:col-span-7">
                      <img
                        src="https://tailwindcss.com/plus-assets/img/ecommerce-images/product-feature-06-detail-02.jpg"
                        className="aspect-5/2 w-full rounded-lg object-cover"
                        alt="Material"
                      />
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="considerations" className="pt-10">
                  <div className="flex flex-col-reverse lg:grid lg:grid-cols-12 lg:gap-x-8">
                    <div className="mt-6 lg:col-span-5 lg:mt-0">
                      <h3 className="text-lg font-medium text-gray-900">Helpful around the home</h3>
                      <p className="mt-2 text-sm text-gray-500">
                        Our customers use Organize throughout the house in workspace, kitchen, living room, and more.
                      </p>
                    </div>
                    <div className="lg:col-span-7">
                      <img
                        src="https://tailwindcss.com/plus-assets/img/ecommerce-images/product-feature-06-detail-03.jpg"
                        className="aspect-5/2 w-full rounded-lg object-cover"
                        alt="Usage"
                      />
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="included" className="pt-10">
                  <div className="flex flex-col-reverse lg:grid lg:grid-cols-12 lg:gap-x-8">
                    <div className="mt-6 lg:col-span-5 lg:mt-0">
                      <h3 className="text-lg font-medium text-gray-900">Everything you'll need</h3>
                      <p className="mt-2 text-sm text-gray-500">
                        The Organize base set includes pen, phone, small, and large trays.
                      </p>
                    </div>
                    <div className="lg:col-span-7">
                      <img
                        src="https://tailwindcss.com/plus-assets/img/ecommerce-images/product-feature-06-detail-04.jpg"
                        className="aspect-5/2 w-full rounded-lg object-cover"
                        alt="Included"
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="Product Features - Four Column Grid">
          <div className="bg-white p-8 rounded-lg">
            <div className="max-w-7xl mx-auto">
              <div className="max-w-3xl">
                <h2 className="font-medium text-gray-500">Focus</h2>
                <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Simple productivity</p>
                <p className="mt-4 text-gray-500">
                  Focus allows you to plan 10 daily tasks, while also thinking ahead about what's next.
                </p>
              </div>
              <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-16">
                <div className="flex flex-col-reverse">
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-gray-900">Three card types</h3>
                    <p className="mt-2 text-sm text-gray-500">Today, Next, and Someday cards for your dreams.</p>
                  </div>
                  <img
                    src="https://tailwindcss.com/plus-assets/img/ecommerce-images/product-feature-08-detail-01.jpg"
                    className="aspect-square w-full rounded-lg object-cover"
                    alt="Feature"
                  />
                </div>
                <div className="flex flex-col-reverse">
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-gray-900">The perfect mix</h3>
                    <p className="mt-2 text-sm text-gray-500">Plenty of cards to last you a month of procrastination.</p>
                  </div>
                  <img
                    src="https://tailwindcss.com/plus-assets/img/ecommerce-images/product-feature-08-detail-02.jpg"
                    className="aspect-square w-full rounded-lg object-cover"
                    alt="Feature"
                  />
                </div>
                <div className="flex flex-col-reverse">
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-gray-900">Dot grid backs</h3>
                    <p className="mt-2 text-sm text-gray-500">Flip a card over to doodle during meetings.</p>
                  </div>
                  <img
                    src="https://tailwindcss.com/plus-assets/img/ecommerce-images/product-feature-08-detail-03.jpg"
                    className="aspect-square w-full rounded-lg object-cover"
                    alt="Feature"
                  />
                </div>
                <div className="flex flex-col-reverse">
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-gray-900">Refill packs</h3>
                    <p className="mt-2 text-sm text-gray-500">Subscribe and save on routine refill packs.</p>
                  </div>
                  <img
                    src="https://tailwindcss.com/plus-assets/img/ecommerce-images/product-feature-08-detail-04.jpg"
                    className="aspect-square w-full rounded-lg object-cover"
                    alt="Feature"
                  />
                </div>
              </div>
            </div>
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="Product Features - Main + Detail Images">
          <div className="bg-white p-8 rounded-lg">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="border-b border-gray-200 pb-10">
                    <h2 className="font-medium text-gray-500">Machined Kettle</h2>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Elegant simplicity</p>
                  </div>
                  <dl className="mt-10 space-y-10">
                    <div>
                      <dt className="text-sm font-medium text-gray-900">Sleek design</dt>
                      <dd className="mt-3 text-sm text-gray-500">Contemporary shape that stands apart from most plastic appliances.</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-900">Comfort handle</dt>
                      <dd className="mt-3 text-sm text-gray-500">Shaped for steady pours and insulated to prevent burns.</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-900">One-button control</dt>
                      <dd className="mt-3 text-sm text-gray-500">Digital readout for setting temperature and power.</dd>
                    </div>
                  </dl>
                </div>
                <div>
                  <img
                    src="https://tailwindcss.com/plus-assets/img/ecommerce-images/product-feature-09-main-detail.jpg"
                    className="aspect-square w-full rounded-lg object-cover"
                    alt="Main"
                  />
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <img
                      src="https://tailwindcss.com/plus-assets/img/ecommerce-images/product-feature-09-detail-01.jpg"
                      className="aspect-square w-full rounded-lg object-cover"
                      alt="Detail 1"
                    />
                    <img
                      src="https://tailwindcss.com/plus-assets/img/ecommerce-images/product-feature-09-detail-02.jpg"
                      className="aspect-square w-full rounded-lg object-cover"
                      alt="Detail 2"
                    />
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