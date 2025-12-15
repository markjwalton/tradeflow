import React from 'react';
import { PageHeader } from '@/components/sturij/PageHeader';
import { ShowcaseSection } from '@/components/showcase/ShowcaseSection';
import { Star, Check, Heart, Minus, Plus, HelpCircle, ChevronDown, Clock, X, Search, ShoppingBag, ShieldCheck, CheckCircle, Menu, User, Trash2, Lock } from 'lucide-react';
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

        <ShowcaseSection title="Header - Simple Mega Menu">
          <div className="bg-white rounded-lg border">
            <div className="bg-gray-900">
              <div className="max-w-7xl mx-auto flex h-10 items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="text-sm font-medium text-white">CAD</div>
                <div className="flex items-center space-x-6">
                  <a href="#" className="text-sm font-medium text-white hover:text-gray-100">Sign in</a>
                  <a href="#" className="text-sm font-medium text-white hover:text-gray-100">Create an account</a>
                </div>
              </div>
            </div>
            <div className="bg-white border-b border-gray-200">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                  <div className="flex items-center">
                    <img
                      src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
                      className="h-8 w-auto"
                      alt="Logo"
                    />
                  </div>
                  <div className="flex items-center space-x-8">
                    <button className="text-sm font-medium text-gray-700 hover:text-gray-800">Women</button>
                    <button className="text-sm font-medium text-gray-700 hover:text-gray-800">Men</button>
                    <a href="#" className="text-sm font-medium text-gray-700 hover:text-gray-800">Company</a>
                    <a href="#" className="text-sm font-medium text-gray-700 hover:text-gray-800">Stores</a>
                  </div>
                  <div className="flex items-center">
                    <a href="#" className="text-sm font-medium text-gray-700 hover:text-gray-800">Search</a>
                    <a href="#" className="ml-8 text-sm font-medium text-gray-700 hover:text-gray-800">Help</a>
                    <a href="#" className="ml-8 group flex items-center">
                      <ShoppingBag className="h-6 w-6 text-gray-400 group-hover:text-gray-500" />
                      <span className="ml-2 text-sm font-medium text-gray-700 group-hover:text-gray-800">0</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="Header - Promo Banner with Mega Menu">
          <div className="bg-white rounded-lg border overflow-hidden">
            <div className="bg-gray-900">
              <div className="max-w-7xl mx-auto flex h-10 items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="text-sm font-medium text-white">CAD</div>
                <p className="text-center text-sm font-medium text-white flex-1">Get free delivery on orders over $100</p>
                <div className="flex items-center space-x-6">
                  <a href="#" className="text-sm font-medium text-white hover:text-gray-100">Create an account</a>
                  <span className="h-6 w-px bg-gray-600" />
                  <a href="#" className="text-sm font-medium text-white hover:text-gray-100">Sign in</a>
                </div>
              </div>
            </div>
            <div className="bg-white border-b border-gray-200">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                  <div className="flex items-center">
                    <img
                      src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
                      className="h-8 w-auto"
                      alt="Logo"
                    />
                  </div>
                  <div className="flex items-center space-x-8">
                    <button className="text-sm font-medium text-gray-700 hover:text-gray-800">Women</button>
                    <button className="text-sm font-medium text-gray-700 hover:text-gray-800">Men</button>
                    <a href="#" className="text-sm font-medium text-gray-700 hover:text-gray-800">Company</a>
                    <a href="#" className="text-sm font-medium text-gray-700 hover:text-gray-800">Stores</a>
                  </div>
                  <div className="flex items-center space-x-6">
                    <Search className="h-6 w-6 text-gray-400 hover:text-gray-500 cursor-pointer" />
                    <User className="h-6 w-6 text-gray-400 hover:text-gray-500 cursor-pointer" />
                    <a href="#" className="group flex items-center">
                      <ShoppingBag className="h-6 w-6 text-gray-400 group-hover:text-gray-500" />
                      <span className="ml-2 text-sm font-medium text-gray-700 group-hover:text-gray-800">0</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="Header - Centered Logo">
          <div className="bg-white rounded-lg border">
            <div className="bg-indigo-600">
              <p className="flex h-10 items-center justify-center px-4 text-sm font-medium text-white sm:px-6 lg:px-8">
                Get free delivery on orders over $100
              </p>
            </div>
            <div className="border-b border-gray-200">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                  <div className="flex items-center">
                    <button className="p-2 text-gray-400">
                      <Menu className="h-6 w-6" />
                    </button>
                    <a href="#" className="ml-2 p-2 text-gray-400 hover:text-gray-500">
                      <Search className="h-6 w-6" />
                    </a>
                  </div>
                  <a href="#" className="flex">
                    <img
                      src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
                      className="h-8 w-auto"
                      alt="Logo"
                    />
                  </a>
                  <div className="flex items-center justify-end">
                    <a href="#" className="flex items-center">
                      <img
                        src="https://tailwindcss.com/plus-assets/img/flags/flag-canada.svg"
                        className="block h-auto w-5"
                        alt="Canada"
                      />
                      <span className="ml-3 block text-sm font-medium">CAD</span>
                    </a>
                    <a href="#" className="ml-6 p-2 text-gray-400 hover:text-gray-500">
                      <Search className="h-6 w-6" />
                    </a>
                    <a href="#" className="p-2 text-gray-400 hover:text-gray-500 ml-4">
                      <User className="h-6 w-6" />
                    </a>
                    <a href="#" className="ml-4 group flex items-center">
                      <ShoppingBag className="h-6 w-6 text-gray-400 group-hover:text-gray-500" />
                      <span className="ml-2 text-sm font-medium text-gray-700 group-hover:text-gray-800">0</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="Header - Simple Bottom Navigation">
          <div className="bg-white rounded-lg border">
            <div className="border-b border-gray-200">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                  <div className="flex flex-1">
                    <a href="#">
                      <img
                        src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
                        className="h-8 w-auto"
                        alt="Logo"
                      />
                    </a>
                  </div>
                  <div className="flex items-center space-x-8">
                    <button className="text-sm font-medium text-gray-700 hover:text-gray-800">Women</button>
                    <button className="text-sm font-medium text-gray-700 hover:text-gray-800">Men</button>
                    <a href="#" className="text-sm font-medium text-gray-700 hover:text-gray-800">Company</a>
                    <a href="#" className="text-sm font-medium text-gray-700 hover:text-gray-800">Stores</a>
                  </div>
                  <div className="flex flex-1 items-center justify-end">
                    <Search className="h-6 w-6 text-gray-400 hover:text-gray-500 cursor-pointer" />
                    <a href="#" className="ml-8 group flex items-center">
                      <ShoppingBag className="h-6 w-6 text-gray-400 group-hover:text-gray-500" />
                      <span className="ml-2 text-sm font-medium text-gray-700 group-hover:text-gray-800">0</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="Hero - Full Width Background">
          <div className="bg-white rounded-lg overflow-hidden">
            <div className="relative bg-gray-900">
              <div className="absolute inset-0 overflow-hidden">
                <img
                  src="https://tailwindcss.com/plus-assets/img/ecommerce-images/home-page-01-hero-full-width.jpg"
                  className="w-full h-full object-cover"
                  alt="Hero"
                />
              </div>
              <div className="absolute inset-0 bg-gray-900 opacity-50" />
              <div className="relative max-w-3xl mx-auto flex flex-col items-center px-6 py-32 text-center sm:py-64 lg:px-0">
                <h1 className="text-4xl font-bold tracking-tight text-white lg:text-6xl">New arrivals are here</h1>
                <p className="mt-4 text-xl text-white">
                  The new arrivals have, well, newly arrived. Check out the latest options from our summer small-batch release.
                </p>
                <a href="#" className="mt-8 inline-block rounded-md border border-transparent bg-white px-8 py-3 text-base font-medium text-gray-900 hover:bg-gray-100">
                  Shop New Arrivals
                </a>
              </div>
            </div>
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="Hero - Split Layout with Image">
          <div className="bg-white rounded-lg overflow-hidden">
            <div className="relative bg-gray-100">
              <div className="grid lg:grid-cols-2">
                <div className="max-w-2xl mx-auto px-4 py-24 lg:max-w-none lg:py-64 lg:px-16">
                  <div>
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl xl:text-6xl">
                      Focus on what matters
                    </h1>
                    <p className="mt-4 text-xl text-gray-600">
                      All the charts, datepickers, and notifications in the world can't beat checking off some items on a paper card.
                    </p>
                    <div className="mt-6">
                      <a href="#" className="inline-block rounded-md border border-transparent bg-indigo-600 px-8 py-3 font-medium text-white hover:bg-indigo-700">
                        Shop Productivity
                      </a>
                    </div>
                  </div>
                </div>
                <div className="h-48 sm:h-64 lg:h-full">
                  <img
                    src="https://tailwindcss.com/plus-assets/img/ecommerce-images/home-page-02-hero-half-width.jpg"
                    className="w-full h-full object-cover"
                    alt="Hero"
                  />
                </div>
              </div>
            </div>
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="Hero - Offset Image Grid">
          <div className="bg-white rounded-lg overflow-hidden">
            <div className="pt-16 pb-80 sm:pt-24 sm:pb-40 lg:pt-40 lg:pb-48">
              <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-lg">
                  <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                    Summer styles are finally here
                  </h1>
                  <p className="mt-4 text-xl text-gray-500">
                    This year, our new summer collection will shelter you from the harsh elements.
                  </p>
                </div>
                <div className="mt-10">
                  <a href="#" className="inline-block rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-center font-medium text-white hover:bg-indigo-700">
                    Shop Collection
                  </a>
                </div>
              </div>
            </div>
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="Hero - Overlapping Cards">
          <div className="bg-white rounded-lg overflow-hidden">
            <div className="relative bg-gray-800 h-96">
              <div className="absolute inset-0">
                <img
                  src="https://tailwindcss.com/plus-assets/img/ecommerce-images/home-page-04-hero-full-width.jpg"
                  className="w-full h-full object-cover"
                  alt="Hero"
                />
              </div>
              <div className="absolute inset-0 bg-gray-900 opacity-50" />
              <div className="relative max-w-3xl mx-auto px-6 py-32 text-center">
                <h1 className="text-4xl font-bold tracking-tight text-white lg:text-6xl">Mid-Season Sale</h1>
                <div className="mt-6">
                  <a href="#" className="inline-block rounded-md border border-transparent bg-indigo-600 px-8 py-3 font-medium text-white hover:bg-indigo-700">
                    Shop Collection
                  </a>
                </div>
              </div>
            </div>
            <div className="-mt-48 max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 px-4 sm:px-6 lg:px-8">
              {['Women\'s', 'Men\'s', 'Desk Accessories'].map((name) => (
                <div key={name} className="relative h-96 rounded-lg bg-white shadow-xl">
                  <div className="absolute inset-0 overflow-hidden rounded-lg">
                    <img
                      src="https://tailwindcss.com/plus-assets/img/ecommerce-images/home-page-04-collection-01.jpg"
                      className="w-full h-full object-cover"
                      alt={name}
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-50" />
                  </div>
                  <div className="absolute inset-0 flex items-end rounded-lg p-6">
                    <div>
                      <p className="text-sm text-white">Shop the collection</p>
                      <h3 className="mt-1 font-semibold text-white">
                        <a href="#">{name}</a>
                      </h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="CTA - Full Width Image Overlay">
          <div className="bg-white p-8 rounded-lg">
            <div className="max-w-7xl mx-auto">
              <div className="relative overflow-hidden rounded-lg">
                <div className="absolute inset-0">
                  <img
                    src="https://tailwindcss.com/plus-assets/img/ecommerce-images/home-page-01-feature-section-01.jpg"
                    className="w-full h-full object-cover"
                    alt="CTA"
                  />
                </div>
                <div className="relative bg-gray-900/75 px-6 py-32 sm:px-12 sm:py-40 lg:px-16">
                  <div className="relative max-w-3xl mx-auto flex flex-col items-center text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                      Level up your desk
                    </h2>
                    <p className="mt-3 text-xl text-white">
                      Make your desk beautiful and organized. Post a picture to social media and watch it get more likes.
                    </p>
                    <a href="#" className="mt-8 block rounded-md border border-transparent bg-white px-8 py-3 text-base font-medium text-gray-900 hover:bg-gray-100">
                      Shop Workspace
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="CTA - Background with Testimonials">
          <div className="bg-white rounded-lg overflow-hidden">
            <div className="relative">
              <div className="absolute inset-0 overflow-hidden">
                <img
                  src="https://tailwindcss.com/plus-assets/img/ecommerce-images/home-page-02-sale-full-width.jpg"
                  className="w-full h-full object-cover"
                  alt="Background"
                />
              </div>
              <div className="absolute inset-0 bg-white/75" />
              <div className="relative max-w-7xl mx-auto px-4 pt-32 text-center">
                <div className="max-w-2xl mx-auto">
                  <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
                    Get 25% off during our one-time sale
                  </h2>
                  <p className="mt-4 max-w-xl mx-auto text-xl text-gray-600">
                    Most of our products are limited releases that won't come back.
                  </p>
                  <a href="#" className="mt-6 inline-block rounded-md border border-transparent bg-gray-900 px-8 py-3 font-medium text-white hover:bg-gray-800">
                    Get access to our one-time sale
                  </a>
                </div>
              </div>
              <div className="relative max-w-7xl mx-auto px-4 py-24">
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">What are people saying?</h2>
                <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {[
                    { quote: 'My order arrived super quickly. The product is even better than I hoped it would be!', author: 'Sarah Peters' },
                    { quote: 'The whole process was so simple that I ended up ordering two new items!', author: 'Kelly McPherson' },
                    { quote: 'I know the quality will always be there.', author: 'Chris Paul' },
                  ].map((testimonial, i) => (
                    <blockquote key={i}>
                      <svg width={24} height={18} viewBox="0 0 24 18" className="text-gray-300">
                        <path
                          d="M0 18h8.7v-5.555c-.024-3.906 1.113-6.841 2.892-9.68L6.452 0C3.188 2.644-.026 7.86 0 12.469V18zm12.408 0h8.7v-5.555C21.083 8.539 22.22 5.604 24 2.765L18.859 0c-3.263 2.644-6.476 7.86-6.451 12.469V18z"
                          fill="currentColor"
                        />
                      </svg>
                      <p className="mt-8 text-lg text-gray-600">{testimonial.quote}</p>
                      <cite className="mt-4 block font-semibold text-gray-900 not-italic">{testimonial.author}</cite>
                    </blockquote>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="CTA - Image with Text Overlay">
          <div className="bg-white p-8 rounded-lg">
            <div className="max-w-7xl mx-auto">
              <div className="relative overflow-hidden rounded-lg bg-gray-800 px-6 py-32 sm:px-12 sm:py-40 lg:px-16">
                <div className="absolute inset-0 overflow-hidden">
                  <img
                    src="https://tailwindcss.com/plus-assets/img/ecommerce-images/home-page-03-feature-section-full-width.jpg"
                    className="w-full h-full object-cover"
                    alt="Background"
                  />
                </div>
                <div className="absolute inset-0 bg-gray-900/50" />
                <div className="relative max-w-3xl mx-auto flex flex-col items-center text-center">
                  <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Long-term thinking</h2>
                  <p className="mt-3 text-xl text-white">
                    We're committed to responsible, sustainable, and ethical manufacturing. Our small-scale approach allows us to focus on quality.
                  </p>
                  <a href="#" className="mt-8 block rounded-md border border-transparent bg-white px-8 py-3 text-base font-medium text-gray-900 hover:bg-gray-100">
                    Read our story
                  </a>
                </div>
              </div>
            </div>
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="Hero - Sale Banner with Images">
          <div className="bg-white rounded-lg overflow-hidden">
            <div className="bg-gray-800 pt-48 pb-16 sm:pb-24">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl">
                  <h2 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
                    Final Stock.
                    <br />
                    Up to 50% off.
                  </h2>
                  <div className="mt-6">
                    <a href="#" className="font-semibold text-white">
                      Shop the sale
                      <span aria-hidden="true"> →</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="Offer Bar - Three Column">
          <div className="bg-white rounded-lg border overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-gray-200">
              <div className="flex flex-col items-center justify-center bg-white px-4 py-6 text-center">
                <p className="text-sm text-gray-500">Download the app</p>
                <p className="font-semibold text-gray-900">Get an exclusive $5 off code</p>
              </div>
              <div className="flex flex-col items-center justify-center bg-white px-4 py-6 text-center">
                <p className="text-sm text-gray-500">Return when you're ready</p>
                <p className="font-semibold text-gray-900">60 days of free returns</p>
              </div>
              <div className="flex flex-col items-center justify-center bg-white px-4 py-6 text-center">
                <p className="text-sm text-gray-500">Sign up for our newsletter</p>
                <p className="font-semibold text-gray-900">15% off your first order</p>
              </div>
            </div>
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="Checkout - Two Column Form">
          <div className="bg-gray-50 p-8 rounded-lg">
            <div className="max-w-7xl mx-auto">
              <h2 className="sr-only">Checkout</h2>
              <div className="grid lg:grid-cols-2 gap-12">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">Contact information</h2>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700">Email address</label>
                    <input type="email" className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                  </div>

                  <div className="mt-10 border-t border-gray-200 pt-10">
                    <h2 className="text-lg font-medium text-gray-900">Shipping information</h2>
                    <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">First name</label>
                        <input type="text" className="mt-2 block w-full rounded-md border-gray-300 shadow-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Last name</label>
                        <input type="text" className="mt-2 block w-full rounded-md border-gray-300 shadow-sm" />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Address</label>
                        <input type="text" className="mt-2 block w-full rounded-md border-gray-300 shadow-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">City</label>
                        <input type="text" className="mt-2 block w-full rounded-md border-gray-300 shadow-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Postal code</label>
                        <input type="text" className="mt-2 block w-full rounded-md border-gray-300 shadow-sm" />
                      </div>
                    </div>
                  </div>

                  <div className="mt-10 border-t border-gray-200 pt-10">
                    <h2 className="text-lg font-medium text-gray-900">Delivery method</h2>
                    <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                      {[
                        { title: 'Standard', turnaround: '4–10 business days', price: '$5.00' },
                        { title: 'Express', turnaround: '2–5 business days', price: '$16.00' },
                      ].map((method) => (
                        <label key={method.title} className="relative flex rounded-lg border border-gray-300 bg-white p-4 cursor-pointer hover:border-gray-400">
                          <input type="radio" name="delivery-method" className="sr-only" />
                          <div className="flex-1">
                            <span className="block text-sm font-medium text-gray-900">{method.title}</span>
                            <span className="mt-1 block text-sm text-gray-500">{method.turnaround}</span>
                            <span className="mt-6 block text-sm font-medium text-gray-900">{method.price}</span>
                          </div>
                          <CheckCircle className="h-5 w-5 text-indigo-600" />
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="mt-10 border-t border-gray-200 pt-10">
                    <h2 className="text-lg font-medium text-gray-900">Payment</h2>
                    <div className="mt-6 grid grid-cols-4 gap-x-4 gap-y-6">
                      <div className="col-span-4">
                        <label className="block text-sm font-medium text-gray-700">Card number</label>
                        <input type="text" className="mt-2 block w-full rounded-md border-gray-300 shadow-sm" />
                      </div>
                      <div className="col-span-4">
                        <label className="block text-sm font-medium text-gray-700">Name on card</label>
                        <input type="text" className="mt-2 block w-full rounded-md border-gray-300 shadow-sm" />
                      </div>
                      <div className="col-span-3">
                        <label className="block text-sm font-medium text-gray-700">Expiration date (MM/YY)</label>
                        <input type="text" className="mt-2 block w-full rounded-md border-gray-300 shadow-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">CVC</label>
                        <input type="text" className="mt-2 block w-full rounded-md border-gray-300 shadow-sm" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-10 lg:mt-0">
                  <h2 className="text-lg font-medium text-gray-900">Order summary</h2>
                  <div className="mt-4 rounded-lg border border-gray-200 bg-white shadow-sm">
                    <ul className="divide-y divide-gray-200">
                      {[
                        { title: 'Basic Tee', color: 'Black', size: 'Large', price: '$32.00' },
                        { title: 'Basic Tee', color: 'Sienna', size: 'Large', price: '$32.00' },
                      ].map((product, i) => (
                        <li key={i} className="flex px-4 py-6 sm:px-6">
                          <div className="w-20 h-20 bg-gray-200 rounded-md" />
                          <div className="ml-6 flex flex-1 flex-col">
                            <div className="flex">
                              <div className="min-w-0 flex-1">
                                <h4 className="text-sm font-medium text-gray-700">{product.title}</h4>
                                <p className="mt-1 text-sm text-gray-500">{product.color}</p>
                                <p className="mt-1 text-sm text-gray-500">{product.size}</p>
                              </div>
                              <button className="ml-4 p-2 text-gray-400 hover:text-gray-500">
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </div>
                            <div className="flex items-end justify-between pt-2">
                              <p className="text-sm font-medium text-gray-900">{product.price}</p>
                              <select className="rounded-md border-gray-300 py-1 text-sm">
                                <option>1</option>
                                <option>2</option>
                                <option>3</option>
                              </select>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                    <dl className="space-y-6 border-t border-gray-200 px-4 py-6 sm:px-6">
                      <div className="flex items-center justify-between">
                        <dt className="text-sm">Subtotal</dt>
                        <dd className="text-sm font-medium text-gray-900">$64.00</dd>
                      </div>
                      <div className="flex items-center justify-between">
                        <dt className="text-sm">Shipping</dt>
                        <dd className="text-sm font-medium text-gray-900">$5.00</dd>
                      </div>
                      <div className="flex items-center justify-between">
                        <dt className="text-sm">Taxes</dt>
                        <dd className="text-sm font-medium text-gray-900">$5.52</dd>
                      </div>
                      <div className="flex items-center justify-between border-t border-gray-200 pt-6">
                        <dt className="text-base font-medium">Total</dt>
                        <dd className="text-base font-medium text-gray-900">$75.52</dd>
                      </div>
                    </dl>
                    <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                      <button className="w-full rounded-md bg-indigo-600 px-4 py-3 text-base font-medium text-white hover:bg-indigo-700">
                        Confirm order
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="Checkout - Split Screen Layout">
          <div className="bg-white rounded-lg overflow-hidden">
            <div className="grid lg:grid-cols-2">
              <div className="bg-gray-50 px-4 py-12 lg:px-8">
                <div className="max-w-lg mx-auto">
                  <h2 className="text-lg font-medium text-gray-900">Order summary</h2>
                  <ul className="mt-6 divide-y divide-gray-200">
                    {[
                      { name: 'Micro Backpack', color: 'Moss', size: '5L', price: '$70.00' },
                      { name: 'Small Stuff Satchel', color: 'Sand', size: '18L', price: '$180.00' },
                    ].map((product, i) => (
                      <li key={i} className="flex items-start space-x-4 py-6">
                        <div className="w-20 h-20 bg-gray-200 rounded-md" />
                        <div className="flex-auto space-y-1">
                          <h3 className="text-sm font-medium text-gray-900">{product.name}</h3>
                          <p className="text-sm text-gray-500">{product.color}</p>
                          <p className="text-sm text-gray-500">{product.size}</p>
                        </div>
                        <p className="text-base font-medium text-gray-900">{product.price}</p>
                      </li>
                    ))}
                  </ul>
                  <dl className="mt-10 space-y-6 text-sm font-medium text-gray-900 border-t border-gray-200 pt-6">
                    <div className="flex items-center justify-between">
                      <dt className="text-gray-600">Subtotal</dt>
                      <dd>$320.00</dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="text-gray-600">Shipping</dt>
                      <dd>$15.00</dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="text-gray-600">Taxes</dt>
                      <dd>$26.80</dd>
                    </div>
                    <div className="flex items-center justify-between border-t border-gray-200 pt-6">
                      <dt className="text-base">Total</dt>
                      <dd className="text-base">$361.80</dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div className="px-4 py-12 lg:px-8">
                <div className="max-w-lg mx-auto">
                  <h2 className="text-lg font-medium text-gray-900">Contact information</h2>
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700">Email address</label>
                    <input type="email" className="mt-2 block w-full rounded-md border-gray-300 shadow-sm" />
                  </div>

                  <div className="mt-10">
                    <h2 className="text-lg font-medium text-gray-900">Payment details</h2>
                    <div className="mt-6 grid grid-cols-4 gap-4">
                      <div className="col-span-4">
                        <label className="block text-sm font-medium text-gray-700">Name on card</label>
                        <input type="text" className="mt-2 block w-full rounded-md border-gray-300 shadow-sm" />
                      </div>
                      <div className="col-span-4">
                        <label className="block text-sm font-medium text-gray-900">Card number</label>
                        <input type="text" className="mt-2 block w-full rounded-md border-gray-300 shadow-sm" />
                      </div>
                      <div className="col-span-3">
                        <label className="block text-sm font-medium text-gray-700">Expiration date (MM/YY)</label>
                        <input type="text" className="mt-2 block w-full rounded-md border-gray-300 shadow-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">CVC</label>
                        <input type="text" className="mt-2 block w-full rounded-md border-gray-300 shadow-sm" />
                      </div>
                    </div>
                  </div>

                  <div className="mt-10 border-t border-gray-200 pt-6">
                    <button className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                      Continue
                    </button>
                    <p className="mt-4 text-center text-sm text-gray-500">
                      You won't be charged until the next step.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="Checkout - Single Column with Summary">
          <div className="bg-white p-8 rounded-lg">
            <div className="max-w-lg mx-auto">
              <div className="flow-root">
                <ul className="-my-6 divide-y divide-gray-200">
                  {[
                    { name: "Women's Basic Tee", color: 'Gray', size: 'S', price: '$32.00' },
                    { name: "Women's Artwork Tee", color: 'Peach', size: 'S', price: '$36.00' },
                  ].map((product, i) => (
                    <li key={i} className="flex space-x-6 py-6">
                      <div className="w-24 h-24 bg-gray-200 rounded-md" />
                      <div className="flex-auto">
                        <div className="space-y-1 sm:flex sm:items-start sm:justify-between sm:space-x-6">
                          <div className="flex-auto space-y-1 text-sm font-medium">
                            <h3 className="text-gray-900">{product.name}</h3>
                            <p className="text-gray-900">{product.price}</p>
                            <p className="text-gray-500">{product.color}</p>
                            <p className="text-gray-500">{product.size}</p>
                          </div>
                          <div className="flex space-x-4">
                            <button className="text-sm font-medium text-indigo-600 hover:text-indigo-500">Edit</button>
                            <div className="flex border-l border-gray-300 pl-4">
                              <button className="text-sm font-medium text-indigo-600 hover:text-indigo-500">Remove</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <dl className="mt-10 space-y-6 text-sm font-medium text-gray-500">
                <div className="flex justify-between">
                  <dt>Subtotal</dt>
                  <dd className="text-gray-900">$104.00</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Taxes</dt>
                  <dd className="text-gray-900">$8.32</dd>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-6 text-gray-900">
                  <dt className="text-base">Total</dt>
                  <dd className="text-base">$126.32</dd>
                </div>
              </dl>

              <div className="mt-10">
                <h2 className="text-lg font-medium text-gray-900">Contact information</h2>
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700">Email address</label>
                  <input type="email" className="mt-2 block w-full rounded-md border-gray-300 shadow-sm" />
                </div>
                <div className="mt-6 flex gap-3">
                  <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-indigo-600" />
                  <label className="text-sm text-gray-500">
                    I agree to the sale of my personal information.
                  </label>
                </div>
                <button className="mt-6 w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                  Continue
                </button>
              </div>
            </div>
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="Checkout - Dark Sidebar Summary">
          <div className="bg-white rounded-lg overflow-hidden">
            <div className="grid lg:grid-cols-2">
              <div className="bg-indigo-900 text-indigo-300 py-12 px-10">
                <div className="max-w-lg mx-auto">
                  <h2 className="sr-only">Order summary</h2>
                  <dl>
                    <dt className="text-sm font-medium">Amount due</dt>
                    <dd className="mt-1 text-3xl font-bold tracking-tight text-white">$642.60</dd>
                  </dl>
                  <ul className="divide-y divide-white/10 text-sm font-medium mt-8">
                    {[
                      { name: 'High Wall Tote', color: 'White and black', size: '15L', price: '$210.00' },
                      { name: 'Halfsize Tote', color: 'Clay', size: '11L', price: '$330.00' },
                    ].map((product, i) => (
                      <li key={i} className="flex items-start space-x-4 py-6">
                        <div className="w-20 h-20 bg-indigo-800 rounded-md" />
                        <div className="flex-auto space-y-1">
                          <h3 className="text-white">{product.name}</h3>
                          <p>{product.color}</p>
                          <p>{product.size}</p>
                        </div>
                        <p className="text-base font-medium text-white">{product.price}</p>
                      </li>
                    ))}
                  </ul>
                  <dl className="space-y-6 border-t border-white/10 pt-6 text-sm font-medium">
                    <div className="flex items-center justify-between">
                      <dt>Subtotal</dt>
                      <dd>$570.00</dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt>Shipping</dt>
                      <dd>$25.00</dd>
                    </div>
                    <div className="flex items-center justify-between border-t border-white/10 pt-6 text-white">
                      <dt className="text-base">Total</dt>
                      <dd className="text-base">$642.60</dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div className="px-4 py-12 lg:px-8">
                <div className="max-w-lg mx-auto">
                  <h3 className="text-lg font-medium text-gray-900">Contact information</h3>
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700">Email address</label>
                    <input type="email" className="mt-2 block w-full rounded-md border-gray-300 shadow-sm" />
                  </div>

                  <div className="mt-10">
                    <h3 className="text-lg font-medium text-gray-900">Payment details</h3>
                    <div className="mt-6 grid grid-cols-4 gap-4">
                      <div className="col-span-4">
                        <label className="block text-sm font-medium text-gray-700">Card number</label>
                        <input type="text" className="mt-2 block w-full rounded-md border-gray-300 shadow-sm" />
                      </div>
                      <div className="col-span-3">
                        <label className="block text-sm font-medium text-gray-700">Expiration date (MM/YY)</label>
                        <input type="text" className="mt-2 block w-full rounded-md border-gray-300 shadow-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">CVC</label>
                        <input type="text" className="mt-2 block w-full rounded-md border-gray-300 shadow-sm" />
                      </div>
                    </div>
                  </div>

                  <div className="mt-10">
                    <h3 className="text-lg font-medium text-gray-900">Shipping address</h3>
                    <div className="mt-6 grid grid-cols-3 gap-4">
                      <div className="col-span-3">
                        <label className="block text-sm font-medium text-gray-700">Address</label>
                        <input type="text" className="mt-2 block w-full rounded-md border-gray-300 shadow-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">City</label>
                        <input type="text" className="mt-2 block w-full rounded-md border-gray-300 shadow-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">State</label>
                        <input type="text" className="mt-2 block w-full rounded-md border-gray-300 shadow-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Postal code</label>
                        <input type="text" className="mt-2 block w-full rounded-md border-gray-300 shadow-sm" />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-indigo-600" />
                    <label className="text-sm font-medium text-gray-900">
                      Billing address is the same as shipping address
                    </label>
                  </div>

                  <button className="mt-6 w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                    Pay $642.60
                  </button>

                  <p className="mt-6 flex justify-center text-sm font-medium text-gray-500">
                    <Lock className="mr-1.5 h-5 w-5 text-gray-400" />
                    Payment details stored securely
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="Reviews - Detailed with Rating Breakdown">
          <div className="bg-white p-8 rounded-lg">
            <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-8">
              <div className="lg:col-span-4">
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">Customer Reviews</h2>
                <div className="mt-3 flex items-center">
                  <div className="flex items-center">
                    {[0, 1, 2, 3, 4].map((rating) => (
                      <Star key={rating} className={`h-5 w-5 ${rating < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <p className="ml-2 text-sm text-gray-900">Based on 1,624 reviews</p>
                </div>

                <div className="mt-6 space-y-3">
                  {[
                    { rating: 5, count: 1019, total: 1624 },
                    { rating: 4, count: 162, total: 1624 },
                    { rating: 3, count: 97, total: 1624 },
                    { rating: 2, count: 199, total: 1624 },
                    { rating: 1, count: 147, total: 1624 },
                  ].map((item) => (
                    <div key={item.rating} className="flex items-center text-sm">
                      <p className="w-3 font-medium text-gray-900">{item.rating}</p>
                      <Star className="ml-1 h-5 w-5 text-yellow-400" />
                      <div className="relative ml-3 flex-1">
                        <div className="h-3 rounded-full border border-gray-200 bg-gray-100" />
                        <div
                          style={{ width: `${Math.round((item.count / item.total) * 100)}%` }}
                          className="absolute inset-y-0 rounded-full border border-yellow-400 bg-yellow-400"
                        />
                      </div>
                      <p className="ml-3 w-10 text-right text-sm text-gray-900">
                        {Math.round((item.count / item.total) * 100)}%
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-10">
                  <h3 className="text-lg font-medium text-gray-900">Share your thoughts</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    If you've used this product, share your thoughts with other customers
                  </p>
                  <button className="mt-6 w-full rounded-md border border-gray-300 bg-white px-8 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50">
                    Write a review
                  </button>
                </div>
              </div>

              <div className="mt-16 lg:col-span-7 lg:col-start-6 lg:mt-0">
                <div className="flow-root">
                  <div className="-my-12 divide-y divide-gray-200">
                    {[
                      { author: 'Emily Selman', rating: 5, content: 'This is the bag of my dreams. I took it on my last vacation!' },
                      { author: 'Hector Gibbons', rating: 5, content: 'Blown away by how polished this icon pack is.' },
                      { author: 'Mark Edwards', rating: 4, content: 'Really happy with look and options of these icons.' },
                    ].map((review, i) => (
                      <div key={i} className="py-12">
                        <div className="flex items-center">
                          <div className="w-12 h-12 rounded-full bg-gray-200" />
                          <div className="ml-4">
                            <h4 className="text-sm font-bold text-gray-900">{review.author}</h4>
                            <div className="mt-1 flex items-center">
                              {[0, 1, 2, 3, 4].map((rating) => (
                                <Star key={rating} className={`h-5 w-5 ${rating < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                              ))}
                            </div>
                          </div>
                        </div>
                        <p className="mt-4 text-base text-gray-600 italic">{review.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="Reviews - Simple List">
          <div className="bg-white p-8 rounded-lg">
            <h2 className="text-lg font-medium text-gray-900">Recent reviews</h2>
            <div className="mt-6 divide-y divide-gray-200 border-t border-b border-gray-200">
              {[
                { author: 'Risako M', title: "Can't say enough good things", rating: 5, date: 'May 16, 2021', content: 'The product quality is amazing, it looks and feel even better than I had anticipated.' },
                { author: 'Jackie H', title: 'Very comfy and looks the part', rating: 5, date: 'April 6, 2021', content: 'These shirts are so comfortable, yet look classy enough for work or formal events.' },
                { author: 'Laura G', title: 'The last shirts I may ever need', rating: 4, date: 'February 24, 2021', content: 'Even after a dozen of washes, they still look and feel good as new.' },
              ].map((review, i) => (
                <div key={i} className="py-10 lg:grid lg:grid-cols-12 lg:gap-x-8">
                  <div className="lg:col-span-8 lg:col-start-5">
                    <div className="flex items-center">
                      {[0, 1, 2, 3, 4].map((rating) => (
                        <Star key={rating} className={`h-5 w-5 ${rating < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                      ))}
                      <p className="ml-3 text-sm text-gray-700">{review.rating}</p>
                    </div>
                    <div className="mt-4">
                      <h3 className="text-sm font-medium text-gray-900">{review.title}</h3>
                      <p className="mt-3 text-sm text-gray-500">{review.content}</p>
                    </div>
                  </div>
                  <div className="mt-6 flex items-center text-sm lg:col-span-4 lg:col-start-1 lg:row-start-1 lg:mt-0 lg:flex-col lg:items-start">
                    <p className="font-medium text-gray-900">{review.author}</p>
                    <time className="ml-4 border-l border-gray-200 pl-4 text-gray-500 lg:mt-2 lg:ml-0 lg:border-0 lg:pl-0">
                      {review.date}
                    </time>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="Reviews - Side by Side Layout">
          <div className="bg-white p-8 rounded-lg">
            <h2 className="sr-only">Customer Reviews</h2>
            <div className="space-y-10">
              {[
                { author: 'Mark Edwards', title: 'This is the best white t-shirt out there', rating: 5, content: 'Scientists said it couldn\'t be done, but when I look at this shirt, I see white light.' },
                { author: 'Blake Reid', title: 'Adds the perfect variety to my wardrobe', rating: 4, content: 'I have expanded my wardrobe with three new crewneck options!' },
                { author: 'Ben Russel', title: 'All good things come in 6-Packs', rating: 5, content: 'Tasty beverages, strong abs, and these Basic Tees!' },
              ].map((review, i) => (
                <div key={i} className="flex flex-col sm:flex-row">
                  <div className="order-2 mt-6 sm:mt-0 sm:ml-16">
                    <h3 className="text-sm font-medium text-gray-900">{review.title}</h3>
                    <p className="mt-3 text-sm text-gray-600">{review.content}</p>
                  </div>
                  <div className="order-1 flex items-center sm:flex-col sm:items-start">
                    <div className="w-12 h-12 rounded-full bg-gray-200" />
                    <div className="ml-4 sm:mt-4 sm:ml-0">
                      <p className="text-sm font-medium text-gray-900">{review.author}</p>
                      <div className="mt-2 flex items-center">
                        {[0, 1, 2, 3, 4].map((rating) => (
                          <Star key={rating} className={`h-5 w-5 ${rating < review.rating ? 'fill-gray-900 text-gray-900' : 'text-gray-200'}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="Reviews - Minimal Avatar List">
          <div className="bg-white p-8 rounded-lg">
            <h2 className="sr-only">Customer Reviews</h2>
            <div className="-my-10">
              {[
                { author: 'Emily Selman', rating: 5, date: 'July 16, 2021', content: 'This icon pack is just what I need for my latest project.' },
                { author: 'Hector Gibbons', rating: 5, date: 'July 12, 2021', content: 'Blown away by how polished this icon pack is.' },
                { author: 'Mark Edwards', rating: 4, date: 'July 6, 2021', content: 'Really happy with look and options of these icons.' },
              ].map((review, i) => (
                <div key={i} className="flex space-x-4 text-sm text-gray-500">
                  <div className="flex-none py-10">
                    <div className="w-10 h-10 rounded-full bg-gray-100" />
                  </div>
                  <div className={`flex-1 py-10 ${i > 0 ? 'border-t border-gray-200' : ''}`}>
                    <h3 className="font-medium text-gray-900">{review.author}</h3>
                    <p><time>{review.date}</time></p>
                    <div className="mt-4 flex items-center">
                      {[0, 1, 2, 3, 4].map((rating) => (
                        <Star key={rating} className={`h-5 w-5 ${rating < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    <p className="mt-4 text-sm text-gray-500">{review.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="Order Confirmation - Split Image Layout">
          <div className="bg-white rounded-lg overflow-hidden">
            <div className="grid lg:grid-cols-2">
              <div className="h-80 lg:h-full">
                <img
                  src="https://tailwindcss.com/plus-assets/img/ecommerce-images/confirmation-page-06-hero.jpg"
                  className="w-full h-full object-cover"
                  alt="Confirmation"
                />
              </div>
              <div className="max-w-2xl mx-auto px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
                <h1 className="text-sm font-medium text-indigo-600">Payment successful</h1>
                <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">Thanks for ordering</p>
                <p className="mt-2 text-base text-gray-500">
                  We appreciate your order, we're currently processing it. So hang tight!
                </p>

                <dl className="mt-16 text-sm font-medium">
                  <dt className="text-gray-900">Tracking number</dt>
                  <dd className="mt-2 text-indigo-600">51547878755545848512</dd>
                </dl>

                <ul className="mt-6 divide-y divide-gray-200 border-t border-gray-200 text-sm font-medium text-gray-500">
                  {[
                    { name: 'Basic Tee', color: 'Charcoal', size: 'L', price: '$36.00' },
                    { name: 'Artwork Tee — Iso Dots', color: 'Peach', size: 'S', price: '$36.00' },
                  ].map((product, i) => (
                    <li key={i} className="flex space-x-6 py-6">
                      <div className="w-24 h-24 bg-gray-100 rounded-md" />
                      <div className="flex-auto space-y-1">
                        <h3 className="text-gray-900">{product.name}</h3>
                        <p>{product.color}</p>
                        <p>{product.size}</p>
                      </div>
                      <p className="flex-none font-medium text-gray-900">{product.price}</p>
                    </li>
                  ))}
                </ul>

                <dl className="space-y-6 border-t border-gray-200 pt-6 text-sm font-medium text-gray-500">
                  <div className="flex justify-between">
                    <dt>Subtotal</dt>
                    <dd className="text-gray-900">$72.00</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Shipping</dt>
                    <dd className="text-gray-900">$8.00</dd>
                  </div>
                  <div className="flex items-center justify-between border-t border-gray-200 pt-6 text-gray-900">
                    <dt className="text-base">Total</dt>
                    <dd className="text-base">$86.40</dd>
                  </div>
                </dl>

                <div className="mt-16 grid grid-cols-2 gap-x-4 text-sm text-gray-600">
                  <div>
                    <dt className="font-medium text-gray-900">Shipping Address</dt>
                    <dd className="mt-2">
                      <address className="not-italic">
                        <span className="block">Kristin Watson</span>
                        <span className="block">7363 Cynthia Pass</span>
                        <span className="block">Toronto, ON N3Y 4H8</span>
                      </address>
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-900">Payment Information</dt>
                    <dd className="mt-2">
                      <p className="text-gray-900">Ending with 4242</p>
                      <p>Expires 12 / 21</p>
                    </dd>
                  </div>
                </div>

                <div className="mt-16 border-t border-gray-200 py-6 text-right">
                  <a href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                    Continue Shopping <span aria-hidden="true">→</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="Order Details - With Progress Tracking">
          <div className="bg-gray-50 p-8 rounded-lg">
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-between items-baseline">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Order Details</h1>
                <a href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                  View invoice →
                </a>
              </div>

              <div className="mt-2 border-b border-gray-200 pb-5 flex justify-between text-sm">
                <dl className="flex">
                  <dt className="text-gray-500">Order number&nbsp;</dt>
                  <dd className="font-medium text-gray-900">W086438695</dd>
                  <dt><span className="mx-2 text-gray-400">·</span></dt>
                  <dd className="font-medium text-gray-900">March 22, 2021</dd>
                </dl>
              </div>

              <div className="mt-8 space-y-24">
                {[
                  { name: 'Distant Mountains Artwork Tee', price: '$36.00', status: 'Processing', step: 1 },
                  { name: 'Rainfall Artwork Tee', price: '$36.00', status: 'Shipped', step: 2 },
                ].map((product, i) => (
                  <div key={i} className="grid grid-cols-1 sm:grid-cols-12 gap-6">
                    <div className="sm:col-span-5">
                      <div className="aspect-square w-full rounded-lg bg-gray-200" />
                    </div>
                    <div className="sm:col-span-7">
                      <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
                      <p className="mt-1 font-medium text-gray-900">{product.price}</p>
                      
                      <dl className="grid grid-cols-2 gap-6 border-b border-gray-200 py-8">
                        <div>
                          <dt className="font-medium text-gray-900">Delivery address</dt>
                          <dd className="mt-3 text-gray-500">
                            <span className="block">Floyd Miles</span>
                            <span className="block">7363 Cynthia Pass</span>
                            <span className="block">Toronto, ON N3Y 4H8</span>
                          </dd>
                        </div>
                        <div>
                          <dt className="font-medium text-gray-900">Shipping updates</dt>
                          <dd className="mt-3 text-gray-500">
                            <p>f•••@example.com</p>
                            <p>1•••••••••40</p>
                          </dd>
                        </div>
                      </dl>

                      <p className="mt-6 font-medium text-gray-900">
                        {product.status} on March 24, 2021
                      </p>
                      <div className="mt-6">
                        <div className="overflow-hidden rounded-full bg-gray-200">
                          <div
                            style={{ width: `${(product.step * 2 + 1) / 8 * 100}%` }}
                            className="h-2 rounded-full bg-indigo-600"
                          />
                        </div>
                        <div className="mt-6 hidden sm:grid grid-cols-4 font-medium text-gray-600">
                          <div className="text-indigo-600">Order placed</div>
                          <div className={`text-center ${product.step > 0 ? 'text-indigo-600' : ''}`}>Processing</div>
                          <div className={`text-center ${product.step > 1 ? 'text-indigo-600' : ''}`}>Shipped</div>
                          <div className={`text-right ${product.step > 2 ? 'text-indigo-600' : ''}`}>Delivered</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-24 rounded-lg bg-gray-100 px-6 py-6 lg:px-8">
                <dl className="grid grid-cols-2 gap-6 text-sm">
                  <div>
                    <dt className="font-medium text-gray-900">Billing address</dt>
                    <dd className="mt-3 text-gray-500">
                      <span className="block">Floyd Miles</span>
                      <span className="block">7363 Cynthia Pass</span>
                      <span className="block">Toronto, ON N3Y 4H8</span>
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-900">Payment information</dt>
                    <dd className="mt-3 text-gray-500">
                      <p className="text-gray-900">Ending with 4242</p>
                      <p>Expires 02 / 24</p>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="Order Confirmation - Simple Layout">
          <div className="bg-white p-8 rounded-lg">
            <div className="max-w-3xl mx-auto">
              <div className="max-w-xl">
                <h1 className="text-base font-medium text-indigo-600">Thank you!</h1>
                <p className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">It's on the way!</p>
                <p className="mt-2 text-base text-gray-500">Your order #14034056 has shipped and will be with you soon.</p>

                <dl className="mt-12 text-sm font-medium">
                  <dt className="text-gray-900">Tracking number</dt>
                  <dd className="mt-2 text-indigo-600">51547878755545848512</dd>
                </dl>
              </div>

              <div className="mt-10 border-t border-gray-200">
                <div className="flex space-x-6 border-b border-gray-200 py-10">
                  <div className="w-20 sm:w-40 h-20 sm:h-40 bg-gray-100 rounded-lg" />
                  <div className="flex flex-auto flex-col">
                    <h4 className="font-medium text-gray-900">Cold Brew Bottle</h4>
                    <p className="mt-2 text-sm text-gray-600">
                      This glass bottle comes with a mesh insert for steeping tea or cold-brewing coffee.
                    </p>
                    <div className="mt-6 flex items-end">
                      <dl className="flex divide-x divide-gray-200 text-sm">
                        <div className="flex pr-4 sm:pr-6">
                          <dt className="font-medium text-gray-900">Quantity</dt>
                          <dd className="ml-2 text-gray-700">1</dd>
                        </div>
                        <div className="flex pl-4 sm:pl-6">
                          <dt className="font-medium text-gray-900">Price</dt>
                          <dd className="ml-2 text-gray-700">$32.00</dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                </div>

                <div className="sm:ml-40 sm:pl-6">
                  <dl className="grid grid-cols-2 gap-x-6 py-10 text-sm">
                    <div>
                      <dt className="font-medium text-gray-900">Shipping address</dt>
                      <dd className="mt-2 text-gray-700">
                        <span className="block">Kristin Watson</span>
                        <span className="block">7363 Cynthia Pass</span>
                        <span className="block">Toronto, ON N3Y 4H8</span>
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-900">Payment method</dt>
                      <dd className="mt-2 text-gray-700">
                        <p>Apple Pay</p>
                        <p>Mastercard</p>
                        <p>•••• 1545</p>
                      </dd>
                    </div>
                  </dl>

                  <dl className="space-y-6 border-t border-gray-200 pt-10 text-sm">
                    <div className="flex justify-between">
                      <dt className="font-medium text-gray-900">Subtotal</dt>
                      <dd className="text-gray-700">$36.00</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="flex font-medium text-gray-900">
                        Discount
                        <span className="ml-2 rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-600">STUDENT50</span>
                      </dt>
                      <dd className="text-gray-700">-$18.00 (50%)</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="font-medium text-gray-900">Total</dt>
                      <dd className="text-gray-900">$23.00</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="Order Status - Card Layout with Tracking">
          <div className="bg-gray-50 p-8 rounded-lg">
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-between items-baseline">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Order #54879</h1>
                <p className="text-sm text-gray-600">
                  Order placed <time className="font-medium text-gray-900">March 22, 2021</time>
                </p>
              </div>

              <div className="mt-6 space-y-8">
                {[
                  { name: 'Nomad Tumbler', price: '$35.00', status: 'Preparing to ship', step: 1, date: 'March 24, 2021' },
                  { name: 'Minimalist Wristwatch', price: '$149.00', status: 'Shipped', step: 2, date: 'March 23, 2021' },
                ].map((product, i) => (
                  <div key={i} className="border-t border-b border-gray-200 bg-white shadow-sm sm:rounded-lg sm:border">
                    <div className="px-4 py-6 sm:px-6 lg:grid lg:grid-cols-12 lg:gap-x-8 lg:p-8">
                      <div className="sm:flex lg:col-span-7">
                        <div className="w-full sm:w-40 h-40 bg-gray-200 rounded-lg" />
                        <div className="mt-6 sm:mt-0 sm:ml-6">
                          <h3 className="text-base font-medium text-gray-900">{product.name}</h3>
                          <p className="mt-2 text-sm font-medium text-gray-900">${product.price}</p>
                        </div>
                      </div>

                      <div className="mt-6 lg:col-span-5 lg:mt-0">
                        <dl className="grid grid-cols-2 gap-x-6 text-sm">
                          <div>
                            <dt className="font-medium text-gray-900">Delivery address</dt>
                            <dd className="mt-3 text-gray-500">
                              <span className="block">Floyd Miles</span>
                              <span className="block">7363 Cynthia Pass</span>
                              <span className="block">Toronto, ON N3Y 4H8</span>
                            </dd>
                          </div>
                          <div>
                            <dt className="font-medium text-gray-900">Shipping updates</dt>
                            <dd className="mt-3 text-gray-500">
                              <p>f•••@example.com</p>
                              <p>1•••••••••40</p>
                            </dd>
                          </div>
                        </dl>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 px-4 py-6 sm:px-6 lg:p-8">
                      <p className="text-sm font-medium text-gray-900">
                        {product.status} on {product.date}
                      </p>
                      <div className="mt-6">
                        <div className="overflow-hidden rounded-full bg-gray-200">
                          <div
                            style={{ width: `${(product.step * 2 + 1) / 8 * 100}%` }}
                            className="h-2 rounded-full bg-indigo-600"
                          />
                        </div>
                        <div className="mt-6 hidden sm:grid grid-cols-4 text-sm font-medium text-gray-600">
                          <div className="text-indigo-600">Order placed</div>
                          <div className={`text-center ${product.step > 0 ? 'text-indigo-600' : ''}`}>Processing</div>
                          <div className={`text-center ${product.step > 1 ? 'text-indigo-600' : ''}`}>Shipped</div>
                          <div className={`text-right ${product.step > 2 ? 'text-indigo-600' : ''}`}>Delivered</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-16 bg-gray-100 rounded-lg px-6 py-6 lg:px-8">
                <dl className="grid grid-cols-2 gap-6 text-sm">
                  <div>
                    <dt className="font-medium text-gray-900">Billing address</dt>
                    <dd className="mt-3 text-gray-500">
                      <span className="block">Floyd Miles</span>
                      <span className="block">7363 Cynthia Pass</span>
                      <span className="block">Toronto, ON N3Y 4H8</span>
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-900">Payment information</dt>
                    <dd className="mt-3 text-gray-500">
                      <p className="text-gray-900">Ending with 4242</p>
                      <p>Expires 02 / 24</p>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="Order History - Card with Table">
          <div className="bg-white p-8 rounded-lg">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Order history</h1>
              <p className="mt-2 text-sm text-gray-500">
                Check the status of recent orders, manage returns, and discover similar products.
              </p>

              <div className="mt-16 space-y-8">
                {[
                  { number: 'WU88191111', date: 'January 22, 2021', total: '$238.00' },
                  { number: 'WU88191009', date: 'January 5, 2021', total: '$115.00' },
                ].map((order) => (
                  <div key={order.number} className="border-t border-b border-gray-200 bg-white shadow-sm sm:rounded-lg sm:border">
                    <div className="flex items-center border-b border-gray-200 p-4 sm:grid sm:grid-cols-4 sm:gap-x-6 sm:p-6">
                      <dl className="grid flex-1 grid-cols-2 gap-x-6 text-sm sm:col-span-3 sm:grid-cols-3">
                        <div>
                          <dt className="font-medium text-gray-900">Order number</dt>
                          <dd className="mt-1 text-gray-500">{order.number}</dd>
                        </div>
                        <div className="hidden sm:block">
                          <dt className="font-medium text-gray-900">Date placed</dt>
                          <dd className="mt-1 text-gray-500">{order.date}</dd>
                        </div>
                        <div>
                          <dt className="font-medium text-gray-900">Total amount</dt>
                          <dd className="mt-1 font-medium text-gray-900">{order.total}</dd>
                        </div>
                      </dl>
                      <div className="hidden lg:flex lg:items-center lg:justify-end lg:space-x-4">
                        <button className="rounded-md border border-gray-300 bg-white px-2.5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                          View Order
                        </button>
                        <button className="rounded-md border border-gray-300 bg-white px-2.5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                          View Invoice
                        </button>
                      </div>
                    </div>

                    <table className="w-full text-gray-500">
                      <thead className="sr-only text-left text-sm sm:not-sr-only">
                        <tr>
                          <th scope="col" className="py-3 pr-8 font-normal sm:w-2/5">Product</th>
                          <th scope="col" className="hidden w-1/5 py-3 pr-8 font-normal sm:table-cell">Price</th>
                          <th scope="col" className="hidden py-3 pr-8 font-normal sm:table-cell">Status</th>
                          <th scope="col" className="w-0 py-3 text-right font-normal">Info</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 border-b text-sm sm:border-t">
                        {[
                          { name: 'Micro Backpack', price: '$70.00', status: 'Delivered Jan 25, 2021' },
                          { name: 'Nomad Shopping Tote', price: '$90.00', status: 'Delivered Jan 25, 2021' },
                        ].map((product, i) => (
                          <tr key={i}>
                            <td className="py-6 pr-8">
                              <div className="flex items-center">
                                <div className="mr-6 w-16 h-16 rounded-sm bg-gray-200" />
                                <div>
                                  <div className="font-medium text-gray-900">{product.name}</div>
                                  <div className="mt-1 sm:hidden">{product.price}</div>
                                </div>
                              </div>
                            </td>
                            <td className="hidden py-6 pr-8 sm:table-cell">{product.price}</td>
                            <td className="hidden py-6 pr-8 sm:table-cell">{product.status}</td>
                            <td className="py-6 text-right font-medium whitespace-nowrap">
                              <a href="#" className="text-indigo-600">View</a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="Order History - List with Status Icons">
          <div className="bg-white p-8 rounded-lg">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Order history</h1>
              <p className="mt-2 text-sm text-gray-500">
                Check the status of recent orders, manage returns, and download invoices.
              </p>

              <div className="mt-16 space-y-16 sm:space-y-24">
                {[
                  { number: 'WU88191111', date: 'January 22, 2021', total: '$302.00' },
                  { number: 'WU88191009', date: 'January 5, 2021', total: '$27.00' },
                ].map((order) => (
                  <div key={order.number}>
                    <div className="bg-gray-50 px-4 py-6 sm:rounded-lg sm:p-6 md:flex md:items-center md:justify-between">
                      <dl className="flex-auto divide-y divide-gray-200 text-sm text-gray-600 md:grid md:grid-cols-3 md:gap-x-6 md:divide-y-0">
                        <div className="flex justify-between py-4 md:block md:py-0">
                          <dt className="font-medium text-gray-900">Order number</dt>
                          <dd className="md:mt-1">{order.number}</dd>
                        </div>
                        <div className="flex justify-between py-4 md:block md:py-0">
                          <dt className="font-medium text-gray-900">Date placed</dt>
                          <dd className="md:mt-1">{order.date}</dd>
                        </div>
                        <div className="flex justify-between py-4 md:block md:py-0">
                          <dt className="font-medium text-gray-900">Total amount</dt>
                          <dd className="font-medium text-gray-900 md:mt-1">{order.total}</dd>
                        </div>
                      </dl>
                      <div className="mt-6 space-y-4 sm:flex sm:space-y-0 sm:space-x-4 md:mt-0">
                        <button className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 md:w-auto">
                          View Order
                        </button>
                        <button className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 md:w-auto">
                          View Invoice
                        </button>
                      </div>
                    </div>

                    <div className="mt-6 flow-root px-4 sm:mt-10 sm:px-0">
                      <div className="-my-6 divide-y divide-gray-200 sm:-my-10">
                        {[
                          { name: 'Nomad Tumbler', price: '$35.00', status: 'delivered', date: 'January 25, 2021' },
                          { name: 'Leather Long Wallet', price: '$118.00', status: 'out-for-delivery' },
                        ].map((product, i) => (
                          <div key={i} className="flex py-6 sm:py-10">
                            <div className="min-w-0 flex-1 lg:flex lg:flex-col">
                              <div className="lg:flex-1">
                                <div className="sm:flex">
                                  <h4 className="font-medium text-gray-900">{product.name}</h4>
                                  <p className="mt-1 font-medium text-gray-900 sm:mt-0 sm:ml-6">{product.price}</p>
                                </div>
                                <div className="mt-2 flex text-sm font-medium sm:mt-4">
                                  <a href="#" className="text-indigo-600 hover:text-indigo-500">View Product</a>
                                  <div className="ml-4 border-l border-gray-200 pl-4 sm:ml-6 sm:pl-6">
                                    <a href="#" className="text-indigo-600 hover:text-indigo-500">Buy Again</a>
                                  </div>
                                </div>
                              </div>
                              <div className="mt-6 font-medium">
                                {product.status === 'delivered' ? (
                                  <div className="flex space-x-2">
                                    <CheckCircle className="h-6 w-6 text-green-500" />
                                    <p>Delivered on {product.date}</p>
                                  </div>
                                ) : (
                                  <p>Out for delivery</p>
                                )}
                              </div>
                            </div>
                            <div className="ml-4 shrink-0 sm:order-first sm:m-0 sm:mr-6">
                              <div className="w-20 h-20 sm:w-40 sm:h-40 rounded-lg bg-gray-200" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="Order History - Compact with Action Buttons">
          <div className="bg-white p-8 rounded-lg">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">Your Orders</h1>
              <p className="mt-2 text-sm text-gray-500">
                Check the status of recent orders, manage returns, and discover similar products.
              </p>

              <div className="mt-12 space-y-16">
                {[
                  { number: '4376', status: 'Delivered on January 22, 2021' },
                  { number: '4134', status: 'Delivered on January 5, 2021' },
                ].map((order) => (
                  <section key={order.number}>
                    <div className="space-y-1 md:flex md:items-baseline md:space-x-4">
                      <h2 className="text-lg font-medium text-gray-900">Order #{order.number}</h2>
                      <div className="space-y-5 sm:flex sm:items-baseline sm:justify-between sm:space-y-0 md:min-w-0 md:flex-1">
                        <p className="text-sm font-medium text-gray-500">{order.status}</p>
                        <div className="flex text-sm font-medium">
                          <a href="#" className="text-indigo-600 hover:text-indigo-500">Manage order</a>
                          <div className="ml-4 border-l border-gray-200 pl-4 sm:ml-6 sm:pl-6">
                            <a href="#" className="text-indigo-600 hover:text-indigo-500">View Invoice</a>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flow-root divide-y divide-gray-200 border-t border-gray-200">
                      {[
                        { name: 'Machined Brass Puzzle', price: '$95.00', color: 'Brass', size: '3" x 3" x 3"' },
                        { name: 'Earthen Planter', price: '$62.00', color: 'Natural', size: 'Large' },
                      ].map((product, i) => (
                        <div key={i} className="py-6 sm:flex">
                          <div className="flex space-x-4 sm:min-w-0 sm:flex-1 sm:space-x-6">
                            <div className="w-20 h-20 sm:w-48 sm:h-48 rounded-md bg-gray-200" />
                            <div className="min-w-0 flex-1 pt-1.5 sm:pt-0">
                              <h3 className="text-sm font-medium text-gray-900">{product.name}</h3>
                              <p className="truncate text-sm text-gray-500">
                                <span>{product.color}</span> · <span>{product.size}</span>
                              </p>
                              <p className="mt-1 font-medium text-gray-900">{product.price}</p>
                            </div>
                          </div>
                          <div className="mt-6 space-y-4 sm:mt-0 sm:ml-6 sm:w-40">
                            <button className="w-full rounded-md bg-indigo-600 px-2.5 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                              Buy again
                            </button>
                            <button className="w-full rounded-md border border-gray-300 bg-white px-2.5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                              Shop similar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="Incentives - With Hero Image">
          <div className="bg-gray-50 p-8 rounded-lg">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 items-center gap-x-16 gap-y-10 lg:grid-cols-2">
                <div>
                  <h2 className="text-4xl font-bold tracking-tight text-gray-900">
                    We built our business on great customer service
                  </h2>
                  <p className="mt-4 text-gray-500">
                    At the beginning at least, but then we realized we could make a lot more money if we kinda stopped
                    caring about that. Our new strategy is to write a bunch of things that look really good in the
                    headlines.
                  </p>
                </div>
                <div className="aspect-[3/2] w-full rounded-lg bg-gray-200" />
              </div>
              <div className="mt-16 grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-3">
                {[
                  { name: 'Free shipping', description: "It's not actually free we just price it into the products." },
                  { name: '10-year warranty', description: "If it breaks in the first 10 years we'll replace it." },
                  { name: 'Exchanges', description: "If you don't like it, trade it to one of your friends." },
                ].map((item) => (
                  <div key={item.name} className="sm:flex lg:block">
                    <div className="sm:shrink-0">
                      <div className="w-16 h-16 bg-gray-300 rounded" />
                    </div>
                    <div className="mt-4 sm:mt-0 sm:ml-6 lg:mt-6 lg:ml-0">
                      <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                      <p className="mt-2 text-sm text-gray-500">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="Incentives - 4 Column Simple Grid">
          <div className="bg-gray-50 p-8 rounded-lg">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 gap-y-12 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-4 lg:gap-x-8">
                {[
                  { name: 'Free Shipping', description: "It's not actually free we just price it into the products." },
                  { name: '24/7 Customer Support', description: 'Our AI chat widget is powered by if/else statements.' },
                  { name: 'Fast Shopping Cart', description: "Look how fast that cart is going. What does this mean?" },
                  { name: 'Gift Cards', description: "Buy them for your friends, especially if they don't like our store." },
                ].map((item) => (
                  <div key={item.name}>
                    <div className="h-24 w-auto bg-gray-300 rounded" />
                    <h3 className="mt-6 text-sm font-medium text-gray-900">{item.name}</h3>
                    <p className="mt-2 text-sm text-gray-500">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="Incentives - 3 Column with Header">
          <div className="bg-white p-8 rounded-lg">
            <div className="max-w-7xl mx-auto">
              <div className="max-w-3xl">
                <h2 className="text-4xl font-bold tracking-tight text-gray-900">
                  We built our business on customer service
                </h2>
                <p className="mt-4 text-gray-500">
                  At the beginning at least, but then we realized we could make a lot more money if we kinda stopped caring
                  about that. Our new strategy is to write a bunch of things that look really good.
                </p>
              </div>
              <div className="mt-16 grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-3">
                {[
                  { name: 'Free shipping', description: "It's not actually free we just price it into the products." },
                  { name: '10-year warranty', description: "If it breaks in the first 10 years we'll replace it." },
                  { name: 'Exchanges', description: "If you don't like it, trade it to one of your friends." },
                ].map((item) => (
                  <div key={item.name} className="sm:flex lg:block">
                    <div className="sm:shrink-0">
                      <div className="w-16 h-16 bg-gray-300 rounded" />
                    </div>
                    <div className="mt-4 sm:mt-0 sm:ml-6 lg:mt-6 lg:ml-0">
                      <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                      <p className="mt-2 text-sm text-gray-500">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="Incentives - Centered in Container">
          <div className="bg-white p-8 rounded-lg">
            <div className="max-w-7xl mx-auto">
              <div className="rounded-2xl bg-gray-50 px-6 py-16 sm:p-16">
                <div className="mx-auto max-w-xl lg:max-w-none">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                      We built our business on customer service
                    </h2>
                  </div>
                  <div className="mx-auto mt-12 grid max-w-sm grid-cols-1 gap-x-8 gap-y-10 sm:max-w-none lg:grid-cols-3">
                    {[
                      { name: 'Free shipping', description: "It's not actually free we just price it into the products." },
                      { name: '10-year warranty', description: "If it breaks in the first 10 years we'll replace it." },
                      { name: 'Exchanges', description: "If you don't like it, trade it to one of your friends." },
                    ].map((item) => (
                      <div key={item.name} className="text-center sm:flex sm:text-left lg:block lg:text-center">
                        <div className="sm:shrink-0">
                          <div className="flow-root">
                            <div className="mx-auto w-16 h-16 bg-gray-300 rounded" />
                          </div>
                        </div>
                        <div className="mt-3 sm:mt-0 sm:ml-6 lg:mt-6 lg:ml-0">
                          <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                          <p className="mt-2 text-sm text-gray-500">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="Perks - 2x2 Grid with Descriptions">
          <div className="bg-gray-50 p-8 rounded-lg">
            <div className="max-w-7xl mx-auto">
              <div className="grid max-w-2xl grid-cols-1 gap-x-8 gap-y-12 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
                {[
                  { 
                    name: 'Free delivery', 
                    description: "Order now and you'll get delivery absolutely free. Well, it's not actually free, we just price it into the products." 
                  },
                  { 
                    name: '10-year warranty', 
                    description: "We have a 10 year warranty with every product that you purchase, whether that's a new pen or organizer." 
                  },
                  { 
                    name: 'Exchanges', 
                    description: 'We understand that when your product arrives you might not particularly like it. Conditions apply here.' 
                  },
                  { 
                    name: 'For the planet', 
                    description: "Like you, we love the planet, and so we've pledged 1% of all sales to preservation of the natural environment." 
                  },
                ].map((item) => (
                  <div key={item.name} className="sm:flex">
                    <div className="sm:shrink-0">
                      <div className="flow-root">
                        <div className="h-24 w-28 bg-gray-300 rounded" />
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-0 sm:ml-3">
                      <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                      <p className="mt-2 text-sm text-gray-500">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="Perks - Horizontal Divided Bar">
          <div className="bg-white p-8 rounded-lg">
            <div className="max-w-7xl mx-auto divide-y divide-gray-200 lg:flex lg:justify-center lg:divide-x lg:divide-y-0 lg:py-8">
              {[
                { name: '10-year all-inclusive warranty', description: "We'll replace it with a new one", icon: 'Calendar' },
                { name: 'Free shipping on returns', description: 'Send it back for free', icon: 'Refresh' },
                { name: 'Free, contactless delivery', description: 'The shipping is on us', icon: 'Truck' },
              ].map((item, idx) => (
                <div key={idx} className="py-8 lg:w-1/3 lg:flex-none lg:py-0">
                  <div className="mx-auto flex max-w-xs items-center px-4 lg:max-w-none lg:px-8">
                    <div className="w-8 h-8 shrink-0 bg-indigo-600 rounded" />
                    <div className="ml-4 flex flex-auto flex-col-reverse">
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-500">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="Incentives - Minimal Inline Bar">
          <div className="bg-white rounded-lg overflow-hidden">
            <div className="flex overflow-x-auto">
              <div className="mx-auto flex space-x-12 px-4 py-3 whitespace-nowrap sm:px-6 lg:space-x-24 lg:px-8">
                {[
                  { name: 'Free, contactless delivery', icon: 'Truck' },
                  { name: 'No questions asked returns', icon: 'Check' },
                  { name: '2-year warranty', icon: 'Calendar' },
                ].map((item) => (
                  <div key={item.name} className="flex items-center text-sm font-medium text-indigo-600">
                    <div className="mr-2 w-6 h-6 flex-none bg-indigo-600 rounded" />
                    <p>{item.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="Full Homepage - Dark Hero with Categories & Collections">
          <div className="bg-white rounded-lg overflow-hidden">
            <div className="relative bg-gray-900">
              <div className="absolute inset-0">
                <div className="w-full h-full bg-gray-800" />
              </div>
              <div className="absolute inset-0 bg-gray-900 opacity-50" />
              
              <div className="relative z-10">
                <div className="bg-gray-900 h-10 flex items-center justify-between px-8 text-sm">
                  <div className="text-white">CAD ▼</div>
                  <div className="flex gap-6 text-white">
                    <a href="#" className="hover:text-gray-100">Sign in</a>
                    <a href="#" className="hover:text-gray-100">Create account</a>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-md px-8 h-16 flex items-center justify-between">
                  <div className="flex items-center gap-8">
                    <div className="w-8 h-8 bg-white rounded" />
                    <div className="flex gap-8 text-sm font-medium text-white">
                      <a href="#">Women</a>
                      <a href="#">Men</a>
                      <a href="#">Company</a>
                      <a href="#">Stores</a>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-white">
                    <a href="#">Search</a>
                    <a href="#">Help</a>
                    <a href="#" className="flex items-center gap-2">
                      <ShoppingBagIcon className="h-6 w-6" />
                      <span>0</span>
                    </a>
                  </div>
                </div>
              </div>

              <div className="relative z-10 max-w-3xl mx-auto text-center px-6 py-32 sm:py-64">
                <h1 className="text-4xl font-bold tracking-tight text-white lg:text-6xl">New arrivals are here</h1>
                <p className="mt-4 text-xl text-white">
                  Check out the latest options from our summer small-batch release while they're still in stock.
                </p>
                <button className="mt-8 rounded-md bg-white px-8 py-3 text-base font-medium text-gray-900 hover:bg-gray-100">
                  Shop New Arrivals
                </button>
              </div>
            </div>

            <div className="pt-24">
              <div className="max-w-7xl mx-auto px-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Shop by Category</h2>
                  <a href="#" className="text-sm font-semibold text-indigo-600">Browse all →</a>
                </div>
                <div className="mt-4 flex gap-8 overflow-x-auto">
                  {[
                    'New Arrivals',
                    'Productivity',
                    'Workspace',
                    'Accessories',
                    'Sale'
                  ].map((cat) => (
                    <div key={cat} className="relative h-80 w-56 flex-shrink-0 rounded-lg overflow-hidden">
                      <div className="absolute inset-0 bg-gray-200" />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-800 opacity-50" />
                      <span className="absolute bottom-6 left-0 right-0 text-center text-xl font-bold text-white">
                        {cat}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="max-w-7xl mx-auto px-8 pt-24">
                <div className="relative overflow-hidden rounded-lg">
                  <div className="absolute inset-0 bg-gray-300" />
                  <div className="relative bg-gray-900/75 px-6 py-32 sm:px-12">
                    <div className="max-w-3xl mx-auto text-center">
                      <h2 className="text-3xl font-bold text-white sm:text-4xl">Level up your desk</h2>
                      <p className="mt-3 text-xl text-white">
                        Make your desk beautiful and organized. Post a picture to social media and watch it get more likes.
                      </p>
                      <button className="mt-8 rounded-md bg-white px-8 py-3 text-base font-medium text-gray-900">
                        Shop Workspace
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="max-w-7xl mx-auto px-8 pt-24 pb-24">
                <h2 className="text-2xl font-bold text-gray-900">Shop by Collection</h2>
                <p className="mt-4 text-base text-gray-500">
                  Each season, we collaborate with designers to create a collection inspired by nature.
                </p>
                <div className="mt-10 grid lg:grid-cols-3 gap-x-8 gap-y-12">
                  {[
                    { name: 'Handcrafted Collection', desc: 'Keep your essentials together' },
                    { name: 'Organized Desk Collection', desc: 'Your desk will look great' },
                    { name: 'Focus Collection', desc: 'Be more productive' }
                  ].map((coll) => (
                    <div key={coll.name}>
                      <div className="aspect-[3/2] lg:aspect-[5/6] w-full rounded-lg bg-gray-200" />
                      <h3 className="mt-4 text-base font-semibold text-gray-900">{coll.name}</h3>
                      <p className="mt-2 text-sm text-gray-500">{coll.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="Full Homepage - Split Hero with Offers Bar">
          <div className="bg-white rounded-lg overflow-hidden">
            <div className="bg-gray-900 h-10 flex items-center justify-between px-8 text-sm text-white">
              <div>CAD ▼</div>
              <div>Get free delivery on orders over $100</div>
              <div className="flex gap-6">
                <a href="#">Create account</a>
                <span>|</span>
                <a href="#">Sign in</a>
              </div>
            </div>

            <div className="bg-white border-b h-16 flex items-center justify-between px-8">
              <div className="flex items-center gap-8">
                <div className="w-8 h-8 bg-indigo-600 rounded" />
                <div className="flex gap-8 text-sm font-medium text-gray-700">
                  <a href="#">Women</a>
                  <a href="#">Men</a>
                  <a href="#">Company</a>
                  <a href="#">Stores</a>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <a href="#" className="text-gray-400"><MagnifyingGlassIcon className="h-6 w-6" /></a>
                <a href="#" className="text-gray-400"><UserIcon className="h-6 w-6" /></a>
                <a href="#" className="flex items-center gap-2 text-gray-700">
                  <ShoppingCartIcon className="h-6 w-6 text-gray-400" />
                  <span className="text-sm font-medium">0</span>
                </a>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-0 border-y divide-x">
              {[
                { name: 'Download the app', desc: 'Get an exclusive $5 off code' },
                { name: "Return when you're ready", desc: '60 days of free returns' },
                { name: 'Sign up for our newsletter', desc: '15% off your first order' }
              ].map((offer) => (
                <a key={offer.name} href="#" className="bg-white px-4 py-6 text-center hover:bg-gray-50">
                  <p className="text-sm text-gray-500">{offer.name}</p>
                  <p className="font-semibold text-gray-900">{offer.desc}</p>
                </a>
              ))}
            </div>

            <div className="grid lg:grid-cols-2">
              <div className="bg-gray-100 px-8 py-24 lg:py-64">
                <div className="max-w-2xl">
                  <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl xl:text-6xl">
                    Focus on what matters
                  </h1>
                  <p className="mt-4 text-xl text-gray-600">
                    All the charts and notifications can't beat checking off items on a paper card.
                  </p>
                  <button className="mt-6 rounded-md bg-indigo-600 px-8 py-3 font-medium text-white hover:bg-indigo-700">
                    Shop Productivity
                  </button>
                </div>
              </div>
              <div className="h-48 lg:h-full bg-gray-300" />
            </div>

            <div className="bg-white py-16 sm:py-24">
              <div className="max-w-7xl mx-auto px-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Trending products</h2>
                  <a href="#" className="text-sm font-semibold text-indigo-600">See everything →</a>
                </div>
                <div className="mt-8 grid grid-cols-4 gap-x-8">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i}>
                      <div className="aspect-square w-full rounded-md bg-gray-200" />
                      <div className="mt-6">
                        <p className="text-sm text-gray-500">Color</p>
                        <h3 className="mt-1 font-semibold text-gray-900">Product Name</h3>
                        <p className="mt-1 text-gray-900">$35</p>
                      </div>
                      <div className="mt-6 flex items-center justify-center gap-3">
                        <div className="w-4 h-4 rounded-full bg-gray-900" />
                        <div className="w-4 h-4 rounded-full bg-yellow-200" />
                        <div className="w-4 h-4 rounded-full bg-gray-300" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-gray-100 py-16 sm:py-24">
              <div className="max-w-7xl mx-auto px-8">
                <h2 className="text-2xl font-bold text-gray-900">Collections</h2>
                <div className="mt-6 grid lg:grid-cols-3 gap-x-6 gap-y-12">
                  {[
                    { name: 'Desk and Office', desc: 'Work from home accessories' },
                    { name: 'Self-Improvement', desc: 'Journals and note-taking' },
                    { name: 'Travel', desc: 'Daily commute essentials' }
                  ].map((coll) => (
                    <div key={coll.name}>
                      <div className="aspect-square sm:aspect-[2/1] lg:aspect-square w-full rounded-lg bg-gray-300" />
                      <h3 className="mt-6 text-sm text-gray-500">{coll.name}</h3>
                      <p className="text-base font-semibold text-gray-900">{coll.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gray-300" />
              <div className="relative bg-white/75 px-6 py-32">
                <div className="max-w-2xl mx-auto text-center">
                  <h2 className="text-4xl font-bold text-gray-900 sm:text-5xl lg:text-6xl">
                    Get 25% off during our one-time sale
                  </h2>
                  <p className="mt-4 max-w-xl mx-auto text-xl text-gray-600">
                    Most products are limited releases. Get your favorites while in stock.
                  </p>
                  <button className="mt-6 rounded-md bg-gray-900 px-8 py-3 font-medium text-white hover:bg-gray-800">
                    Get access to our one-time sale
                  </button>
                </div>
              </div>

              <div className="max-w-7xl mx-auto px-8 py-24">
                <h2 className="text-2xl font-bold text-gray-900">What are people saying?</h2>
                <div className="mt-16 grid lg:grid-cols-3 gap-x-8 gap-y-16">
                  {[
                    { quote: 'My order arrived super quickly. Very happy customer!', by: 'Sarah Peters, New Orleans' },
                    { quote: 'The return process was so simple!', by: 'Kelly McPherson, Chicago' },
                    { quote: "I'll probably order a few more. So convenient!", by: 'Chris Paul, Phoenix' }
                  ].map((test, i) => (
                    <blockquote key={i} className="sm:flex lg:block">
                      <svg width={24} height={18} className="shrink-0 text-gray-300">
                        <path d="M0 18h8.7v-5.555c-.024-3.906 1.113-6.841 2.892-9.68L6.452 0C3.188 2.644-.026 7.86 0 12.469V18zm12.408 0h8.7v-5.555C21.083 8.539 22.22 5.604 24 2.765L18.859 0c-3.263 2.644-6.476 7.86-6.451 12.469V18z" fill="currentColor" />
                      </svg>
                      <div className="mt-8 sm:mt-0 sm:ml-6 lg:mt-10 lg:ml-0">
                        <p className="text-lg text-gray-600">{test.quote}</p>
                        <cite className="mt-4 block font-semibold text-gray-900 not-italic">{test.by}</cite>
                      </div>
                    </blockquote>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="Full Homepage - Image Grid Hero with Categories">
          <div className="bg-white rounded-lg overflow-hidden">
            <div className="bg-white/90 backdrop-blur-xl h-16 flex items-center justify-between px-8 border-b">
              <div className="flex items-center gap-8">
                <div className="w-8 h-8 bg-indigo-600 rounded" />
                <div className="flex gap-8 text-sm font-medium text-gray-700">
                  <a href="#">Women</a>
                  <a href="#">Men</a>
                  <a href="#">Company</a>
                  <a href="#">Stores</a>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <a href="#" className="text-sm font-medium text-gray-700">Sign in</a>
                <span className="h-6 w-px bg-gray-200" />
                <a href="#" className="text-sm font-medium text-gray-700">Create account</a>
                <a href="#" className="text-gray-400 ml-6"><MagnifyingGlassIcon className="h-6 w-6" /></a>
                <a href="#" className="flex items-center gap-2">
                  <ShoppingBagIcon className="h-6 w-6 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">0</span>
                </a>
              </div>
            </div>

            <div className="pt-16 pb-80 sm:pt-24">
              <div className="relative max-w-7xl mx-auto px-8">
                <div className="sm:max-w-lg">
                  <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                    Summer styles are finally here
                  </h1>
                  <p className="mt-4 text-xl text-gray-500">
                    Our new summer collection will shelter you from the harsh elements.
                  </p>
                </div>
                <div className="mt-10">
                  <button className="rounded-md bg-indigo-600 px-8 py-3 text-center font-medium text-white hover:bg-indigo-700">
                    Shop Collection
                  </button>
                </div>

                <div className="absolute right-0 top-0 hidden lg:block">
                  <div className="flex gap-6">
                    <div className="grid gap-y-8">
                      <div className="h-64 w-44 rounded-lg bg-gray-200" />
                      <div className="h-64 w-44 rounded-lg bg-gray-200" />
                    </div>
                    <div className="grid gap-y-8">
                      <div className="h-64 w-44 rounded-lg bg-gray-200" />
                      <div className="h-64 w-44 rounded-lg bg-gray-200" />
                      <div className="h-64 w-44 rounded-lg bg-gray-200" />
                    </div>
                    <div className="grid gap-y-8">
                      <div className="h-64 w-44 rounded-lg bg-gray-200" />
                      <div className="h-64 w-44 rounded-lg bg-gray-200" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 py-24">
              <div className="max-w-7xl mx-auto px-8">
                <div className="flex items-baseline justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Shop by Category</h2>
                  <a href="#" className="text-sm font-semibold text-indigo-600">Browse all →</a>
                </div>
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 sm:grid-rows-2 gap-6 lg:gap-8">
                  <div className="group relative sm:row-span-2 sm:aspect-square aspect-[2/1] rounded-lg overflow-hidden">
                    <div className="absolute inset-0 bg-gray-300" />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-50" />
                    <div className="absolute inset-0 flex items-end p-6">
                      <div>
                        <h3 className="font-semibold text-white">New Arrivals</h3>
                        <p className="mt-1 text-sm text-white">Shop now</p>
                      </div>
                    </div>
                  </div>
                  <div className="group relative aspect-[2/1] rounded-lg overflow-hidden">
                    <div className="absolute inset-0 bg-gray-300" />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-50" />
                    <div className="absolute inset-0 flex items-end p-6">
                      <div>
                        <h3 className="font-semibold text-white">Accessories</h3>
                        <p className="mt-1 text-sm text-white">Shop now</p>
                      </div>
                    </div>
                  </div>
                  <div className="group relative aspect-[2/1] rounded-lg overflow-hidden">
                    <div className="absolute inset-0 bg-gray-300" />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-50" />
                    <div className="absolute inset-0 flex items-end p-6">
                      <div>
                        <h3 className="font-semibold text-white">Workspace</h3>
                        <p className="mt-1 text-sm text-white">Shop now</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="py-24">
              <div className="max-w-7xl mx-auto px-8">
                <div className="flex items-baseline justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Our Favorites</h2>
                  <a href="#" className="text-sm font-semibold text-indigo-600">Browse all →</a>
                </div>
                <div className="mt-6 grid sm:grid-cols-3 gap-x-6 gap-y-10">
                  {[1, 2, 3].map((i) => (
                    <div key={i}>
                      <div className="h-96 sm:aspect-[2/3] sm:h-auto w-full rounded-lg bg-gray-200" />
                      <h3 className="mt-4 text-base font-semibold text-gray-900">Product Name</h3>
                      <p className="mt-1 text-sm text-gray-500">$32</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-gray-800 pt-14 pb-16 sm:pb-24">
              <div className="max-w-7xl mx-auto px-8">
                <div className="relative">
                  <h2 className="text-4xl font-bold text-white md:text-5xl">
                    Final Stock.<br />Up to 50% off.
                  </h2>
                  <div className="mt-6">
                    <a href="#" className="font-semibold text-white">
                      Shop the sale →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="Full Homepage - Overlapping Hero Cards">
          <div className="bg-white rounded-lg overflow-hidden">
            <div className="bg-gray-900 h-10 flex items-center justify-between px-8 text-sm text-white">
              <div>CAD ▼</div>
              <div className="flex gap-6">
                <a href="#">Sign in</a>
                <a href="#">Create account</a>
              </div>
            </div>

            <div className="bg-white px-8 h-16 flex items-center justify-between">
              <div className="flex items-center gap-8">
                <div className="w-8 h-8 bg-indigo-600 rounded" />
                <div className="flex gap-8 text-sm font-medium text-gray-700">
                  <a href="#">Women</a>
                  <a href="#">Men</a>
                  <a href="#">Company</a>
                  <a href="#">Stores</a>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <a href="#" className="text-sm font-medium text-gray-700">Search</a>
                <a href="#" className="text-sm font-medium text-gray-700">Help</a>
                <a href="#" className="flex items-center gap-2">
                  <ShoppingBagIcon className="h-6 w-6 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">0</span>
                </a>
              </div>
            </div>

            <div className="relative bg-gray-800">
              <div className="absolute inset-0 bg-gray-400" />
              <div className="absolute inset-0 bg-gray-900 opacity-50" />
              <div className="relative px-6 py-32 text-center">
                <h1 className="text-4xl font-bold text-white sm:text-5xl md:text-6xl">Mid-Season Sale</h1>
                <button className="mt-6 rounded-md bg-indigo-600 px-8 py-3 font-medium text-white hover:bg-indigo-700">
                  Shop Collection
                </button>
              </div>
            </div>

            <div className="relative -mt-96 sm:mt-0">
              <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 px-8">
                {[
                  { name: "Women's", desc: 'Shop the collection' },
                  { name: "Men's", desc: 'Shop the collection' },
                  { name: 'Desk Accessories', desc: 'Shop the collection' }
                ].map((coll) => (
                  <div key={coll.name} className="relative h-96 sm:aspect-[4/5] sm:h-auto rounded-lg overflow-hidden shadow-xl bg-white">
                    <div className="absolute inset-0 bg-gray-200" />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-50" />
                    <div className="absolute inset-0 flex items-end p-6">
                      <div>
                        <p className="text-sm text-white">{coll.desc}</p>
                        <h3 className="mt-1 font-semibold text-white">{coll.name}</h3>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="max-w-7xl mx-auto px-8 py-24">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Trending Products</h2>
                <a href="#" className="text-sm font-medium text-indigo-600">Shop collection →</a>
              </div>
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-10">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i}>
                    <div className="h-56 lg:h-72 xl:h-80 w-full rounded-md bg-gray-200" />
                    <h3 className="mt-4 text-sm text-gray-700">Product Name</h3>
                    <p className="mt-1 text-sm text-gray-500">Color</p>
                    <p className="mt-1 text-sm font-medium text-gray-900">$75</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t bg-gray-50 py-24">
              <div className="max-w-7xl mx-auto px-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-12 gap-x-6">
                  {[
                    { name: 'Free returns', desc: 'Not what you expected? Place it back in the parcel.' },
                    { name: 'Same day delivery', desc: 'Checkout today and receive within hours.' },
                    { name: 'All year discount', desc: 'Use code "ALLYEAR" at checkout.' },
                    { name: 'For the planet', desc: "We've pledged 1% of sales to nature." }
                  ].map((perk) => (
                    <div key={perk.name} className="text-center md:flex md:items-start md:text-left lg:block lg:text-center">
                      <div className="md:shrink-0">
                        <div className="h-24 w-auto mx-auto bg-gray-300 rounded" />
                      </div>
                      <div className="mt-6 md:mt-0 md:ml-4 lg:mt-6 lg:ml-0">
                        <h3 className="text-base font-medium text-gray-900">{perk.name}</h3>
                        <p className="mt-3 text-sm text-gray-500">{perk.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="Product Detail Page - Centered Logo with Side Gallery">
          <div className="bg-white rounded-lg overflow-hidden">
            <div className="border-b h-16 flex items-center justify-between px-8">
              <div className="flex-1 flex items-center gap-8">
                <div className="flex gap-8 text-sm font-medium text-gray-700">
                  <a href="#">Women</a>
                  <a href="#">Men</a>
                  <a href="#">Company</a>
                </div>
              </div>
              <div className="w-8 h-8 bg-indigo-600 rounded" />
              <div className="flex-1 flex items-center justify-end gap-6">
                <a href="#" className="text-gray-700 flex items-center gap-2">
                  <img src="https://tailwindcss.com/plus-assets/img/flags/flag-canada.svg" className="w-5 h-auto" alt="" />
                  <span className="text-sm font-medium">CAD</span>
                </a>
                <a href="#" className="text-gray-400"><MagnifyingGlassIcon className="h-6 w-6" /></a>
                <a href="#" className="text-gray-400"><UserIcon className="h-6 w-6" /></a>
                <a href="#" className="flex items-center gap-2">
                  <ShoppingBagIcon className="h-6 w-6 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">0</span>
                </a>
              </div>
            </div>

            <div className="max-w-7xl mx-auto mt-8 px-8 pb-16">
              <div className="lg:grid lg:grid-cols-12 lg:gap-x-8">
                <div className="lg:col-span-5 lg:col-start-8">
                  <div className="flex justify-between">
                    <h1 className="text-xl font-medium text-gray-900">Basic Tee</h1>
                    <p className="text-xl font-medium text-gray-900">$35</p>
                  </div>
                  <div className="mt-4 flex items-center">
                    <div className="flex items-center">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <StarIcon key={i} className={`h-5 w-5 ${i < 4 ? 'text-yellow-400' : 'text-gray-200'}`} />
                      ))}
                    </div>
                    <p className="ml-2 text-sm text-gray-700">3.9</p>
                    <div className="ml-4 text-sm text-gray-300">·</div>
                    <a href="#" className="ml-4 text-sm font-medium text-indigo-600">See all 512 reviews</a>
                  </div>
                </div>

                <div className="mt-8 lg:col-span-7 lg:col-start-1 lg:row-span-3 lg:row-start-1 lg:mt-0">
                  <div className="grid grid-cols-1 lg:grid-cols-2 lg:grid-rows-3 lg:gap-8">
                    <div className="lg:col-span-2 lg:row-span-2 aspect-square lg:aspect-auto rounded-lg bg-gray-200" />
                    <div className="hidden lg:block rounded-lg bg-gray-200" />
                    <div className="hidden lg:block rounded-lg bg-gray-200" />
                  </div>
                </div>

                <div className="mt-8 lg:col-span-5">
                  <div>
                    <h2 className="text-sm font-medium text-gray-900">Color</h2>
                    <div className="mt-2 flex items-center gap-x-3">
                      <div className="flex rounded-full outline -outline-offset-1 outline-black/10">
                        <div className="w-8 h-8 appearance-none rounded-full bg-gray-900" />
                      </div>
                      <div className="flex rounded-full outline -outline-offset-1 outline-black/10">
                        <div className="w-8 h-8 appearance-none rounded-full bg-gray-400" />
                      </div>
                    </div>
                  </div>

                  <div className="mt-8">
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm font-medium text-gray-900">Size</h2>
                      <a href="#" className="text-sm font-medium text-indigo-600">See sizing chart</a>
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-3 sm:grid-cols-6">
                      {['XXS', 'XS', 'S', 'M', 'L', 'XL'].map((size) => (
                        <label key={size} className="relative flex rounded-md border border-gray-300 bg-white p-3 items-center justify-center">
                          <span className="text-sm font-medium text-gray-900 uppercase">{size}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <button className="mt-8 w-full rounded-md bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700">
                    Add to cart
                  </button>

                  <div className="mt-10">
                    <h2 className="text-sm font-medium text-gray-900">Description</h2>
                    <div className="mt-4 space-y-4 text-sm text-gray-500">
                      <p>The Basic tee is an honest new take on a classic. Hand cut and sewn locally.</p>
                    </div>
                  </div>

                  <div className="mt-8 border-t border-gray-200 pt-8">
                    <h2 className="text-sm font-medium text-gray-900">Fabric & Care</h2>
                    <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-gray-500">
                      <li>Only the best materials</li>
                      <li>Ethically and locally made</li>
                      <li>Pre-washed and pre-shrunk</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="mt-16">
                <h2 className="text-lg font-medium text-gray-900">Recent reviews</h2>
                <div className="mt-6 divide-y divide-gray-200 border-t border-b border-gray-200">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="py-10 lg:grid lg:grid-cols-12 lg:gap-x-8">
                      <div className="lg:col-span-8 lg:col-start-5">
                        <div className="flex items-center">
                          {[0, 1, 2, 3, 4].map((r) => (
                            <StarIcon key={r} className={`h-5 w-5 ${r < 5 ? 'text-yellow-400' : 'text-gray-200'}`} />
                          ))}
                          <p className="ml-3 text-sm text-gray-700">5</p>
                        </div>
                        <div className="mt-4">
                          <h3 className="text-sm font-medium text-gray-900">Can't say enough good things</h3>
                          <p className="mt-3 text-sm text-gray-500">I was really pleased with the overall shopping experience.</p>
                        </div>
                      </div>
                      <div className="mt-6 flex items-center text-sm lg:col-span-4 lg:col-start-1 lg:row-start-1 lg:mt-0">
                        <p className="font-medium text-gray-900">Risako M</p>
                        <time className="ml-4 border-l border-gray-200 pl-4 text-gray-500">May 16, 2021</time>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-16">
                <h2 className="text-lg font-medium text-gray-900">Customers also purchased</h2>
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i}>
                      <div className="aspect-square w-full rounded-md bg-gray-200" />
                      <div className="mt-4 flex justify-between">
                        <div>
                          <h3 className="text-sm text-gray-700">Basic Tee</h3>
                          <p className="mt-1 text-sm text-gray-500">Black</p>
                        </div>
                        <p className="text-sm font-medium text-gray-900">$35</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="Product Detail Page - With Promo Bar & Grid Gallery">
          <div className="bg-white rounded-lg overflow-hidden">
            <div className="flex h-10 items-center justify-center bg-indigo-600 px-4 text-sm font-medium text-white">
              Get free delivery on orders over $100
            </div>

            <div className="border-b h-16 flex items-center justify-between px-8">
              <div className="flex items-center gap-8">
                <div className="w-8 h-8 bg-indigo-600 rounded" />
                <div className="flex gap-8 text-sm font-medium text-gray-700">
                  <a href="#">Women</a>
                  <a href="#">Men</a>
                  <a href="#">Company</a>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <a href="#" className="text-sm font-medium text-gray-700">Sign in</a>
                <span className="h-6 w-px bg-gray-200" />
                <a href="#" className="text-sm font-medium text-gray-700">Create account</a>
                <a href="#" className="text-gray-700 flex items-center gap-2 ml-8">
                  <img src="https://tailwindcss.com/plus-assets/img/flags/flag-canada.svg" className="w-5 h-auto" alt="" />
                  <span className="text-sm font-medium">CAD</span>
                </a>
                <a href="#" className="text-gray-400 ml-6"><MagnifyingGlassIcon className="h-6 w-6" /></a>
                <a href="#" className="flex items-center gap-2 ml-4">
                  <ShoppingBagIcon className="h-6 w-6 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">0</span>
                </a>
              </div>
            </div>

            <div className="max-w-2xl mx-auto px-8 pt-16 pb-24 lg:max-w-7xl lg:grid lg:grid-cols-2 lg:gap-x-8">
              <div>
                <nav className="flex items-center space-x-2 text-sm">
                  <a href="#" className="font-medium text-gray-500">Women</a>
                  <span className="text-gray-300">/</span>
                  <a href="#" className="font-medium text-gray-500">Clothing</a>
                  <span className="text-gray-300">/</span>
                  <span className="font-medium text-gray-500">Basic Tee 6-Pack</span>
                </nav>

                <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 lg:grid-rows-3 lg:gap-8">
                  <div className="aspect-square lg:aspect-[3/4] lg:row-span-2 w-full rounded-lg bg-gray-200" />
                  <div className="aspect-[3/2] w-full rounded-lg bg-gray-200" />
                  <div className="aspect-[3/2] w-full rounded-lg bg-gray-200" />
                  <div className="lg:hidden aspect-[4/5] w-full rounded-lg bg-gray-200 mt-6" />
                </div>
              </div>

              <div className="mt-10 lg:col-start-1 lg:row-start-2 lg:max-w-lg lg:self-start lg:mt-0">
                <div className="lg:col-span-2 lg:pr-8">
                  <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Basic Tee 6-Pack</h1>
                </div>

                <div className="mt-4">
                  <p className="text-3xl tracking-tight text-gray-900">$192</p>
                  <div className="mt-6 flex items-center">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <StarIcon key={i} className={`h-5 w-5 ${i < 4 ? 'text-gray-900' : 'text-gray-200'}`} />
                    ))}
                    <a href="#" className="ml-3 text-sm font-medium text-indigo-600">117 reviews</a>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-gray-900">Color</h3>
                    <div className="mt-4 flex items-center gap-x-3">
                      {['bg-white', 'bg-gray-200', 'bg-gray-900'].map((color, i) => (
                        <div key={i} className="flex rounded-full outline -outline-offset-1 outline-black/10">
                          <div className={`w-8 h-8 rounded-full ${color}`} />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-10">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900">Size</h3>
                      <a href="#" className="text-sm font-medium text-indigo-600">Size guide</a>
                    </div>
                    <div className="mt-4 grid grid-cols-4 gap-3">
                      {['XXS', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'].map((size) => (
                        <label key={size} className="relative flex rounded-md border border-gray-300 bg-white p-3 items-center justify-center">
                          <span className="text-sm font-medium text-gray-900 uppercase">{size}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <button className="mt-10 w-full rounded-md bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700">
                    Add to bag
                  </button>
                </div>

                <div className="py-10 border-t border-gray-200 lg:pt-6 lg:pb-16">
                  <div className="space-y-6">
                    <p className="text-base text-gray-900">The Basic Tee 6-Pack allows you to fully express your personality.</p>
                  </div>

                  <div className="mt-10">
                    <h3 className="text-sm font-medium text-gray-900">Highlights</h3>
                    <ul className="mt-4 list-disc space-y-2 pl-4 text-sm">
                      {['Hand cut and sewn locally', 'Dyed with proprietary colors', 'Pre-washed & pre-shrunk'].map((item) => (
                        <li key={item} className="text-gray-400"><span className="text-gray-600">{item}</span></li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-10">
                    <h2 className="text-sm font-medium text-gray-900">Details</h2>
                    <p className="mt-4 text-sm text-gray-600">Includes two black, two white, and two heather gray Basic Tees.</p>
                  </div>
                </div>

                <div className="border-t border-gray-200">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex py-12">
                      <div className="flex-none"><div className="w-12 h-12 rounded-full bg-gray-200" /></div>
                      <div className="ml-4">
                        <h4 className="text-sm font-bold text-gray-900">Emily Selman</h4>
                        <div className="mt-1 flex items-center">
                          {[0, 1, 2, 3, 4].map((r) => (
                            <StarIcon key={r} className={`h-5 w-5 ${r < 5 ? 'text-yellow-400' : 'text-gray-300'}`} />
                          ))}
                        </div>
                        <p className="mt-4 text-base text-gray-600 italic">This is the best white t-shirt out there!</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="Product Detail Page - With Image Tabs & Collapsible Details">
          <div className="bg-white rounded-lg overflow-hidden">
            <div className="flex h-10 items-center justify-center bg-indigo-600 px-4 text-sm font-medium text-white">
              Get free delivery on orders over $100
            </div>

            <div className="border-b h-16 flex items-center justify-between px-8">
              <div className="flex items-center gap-8">
                <div className="w-8 h-8 bg-indigo-600 rounded" />
                <div className="flex gap-8 text-sm font-medium text-gray-700">
                  <a href="#">Women</a>
                  <a href="#">Men</a>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <a href="#" className="text-gray-700 flex items-center gap-2">
                  <img src="https://tailwindcss.com/plus-assets/img/flags/flag-canada.svg" className="w-5 h-auto" alt="" />
                  <span className="text-sm font-medium">CAD</span>
                </a>
                <a href="#" className="text-gray-400"><MagnifyingGlassIcon className="h-6 w-6" /></a>
                <a href="#" className="flex items-center gap-2">
                  <ShoppingBagIcon className="h-6 w-6 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">0</span>
                </a>
              </div>
            </div>

            <div className="max-w-7xl mx-auto px-8">
              <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-8">
                <div className="flex flex-col-reverse">
                  <div className="mt-6 grid grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="relative flex h-24 rounded-md bg-white">
                        <span className="absolute inset-0 overflow-hidden rounded-md">
                          <div className="w-full h-full bg-gray-200" />
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="aspect-square w-full rounded-lg bg-gray-200" />
                </div>

                <div className="mt-10 px-4 sm:mt-16 sm:px-0 lg:mt-0">
                  <h1 className="text-3xl font-bold text-gray-900">Zip Tote Basket</h1>
                  <div className="mt-3">
                    <p className="text-3xl tracking-tight text-gray-900">$140</p>
                  </div>

                  <div className="mt-3 flex items-center">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <StarIcon key={i} className={`h-5 w-5 ${i < 4 ? 'text-indigo-500' : 'text-gray-300'}`} />
                    ))}
                  </div>

                  <div className="mt-6">
                    <p className="text-base text-gray-700">
                      The Zip Tote Basket is the perfect midpoint between shopping tote and comfy backpack.
                    </p>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-sm text-gray-600">Color</h3>
                    <div className="mt-2 flex items-center gap-x-3">
                      {['bg-gray-700', 'bg-white', 'bg-gray-500'].map((color, i) => (
                        <div key={i} className="flex rounded-full outline -outline-offset-1 outline-black/10">
                          <div className={`w-8 h-8 rounded-full ${color}`} />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-10 flex gap-4">
                    <button className="flex-1 rounded-md bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700">
                      Add to bag
                    </button>
                    <button className="rounded-md px-3 py-3 text-gray-400 hover:bg-gray-100">
                      <HeartIcon className="h-6 w-6" />
                    </button>
                  </div>

                  <div className="mt-12 divide-y divide-gray-200 border-t border-gray-200">
                    {[
                      { name: 'Features', items: ['Multiple strap configurations', 'Spacious interior', 'Water-resistant'] },
                      { name: 'Care', items: ['Spot clean as needed', 'Hand wash with mild soap'] },
                    ].map((detail) => (
                      <div key={detail.name} className="py-6">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900">{detail.name}</span>
                          <PlusIcon className="h-6 w-6 text-gray-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="Product Detail Page - With Review Breakdown">
          <div className="bg-gray-50 rounded-lg overflow-hidden">
            <div className="flex h-10 items-center justify-center bg-indigo-600 px-4 text-sm font-medium text-white">
              Get free delivery on orders over $100
            </div>

            <div className="bg-white border-b h-16 flex items-center justify-between px-8">
              <div className="flex items-center gap-8">
                <div className="w-8 h-8 bg-indigo-600 rounded" />
                <div className="flex gap-8 text-sm font-medium text-gray-700">
                  <a href="#">Women</a>
                  <a href="#">Men</a>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <a href="#" className="text-sm font-medium text-gray-700">Sign in</a>
                <a href="#" className="text-gray-400 ml-6"><MagnifyingGlassIcon className="h-6 w-6" /></a>
                <a href="#" className="flex items-center gap-2 ml-4">
                  <ShoppingBagIcon className="h-6 w-6 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">0</span>
                </a>
              </div>
            </div>

            <div className="bg-white">
              <div className="max-w-2xl mx-auto px-8 pt-16 pb-24 lg:max-w-7xl lg:grid lg:grid-cols-2 lg:gap-x-8">
                <div className="lg:max-w-lg lg:self-end">
                  <nav className="flex items-center space-x-2 text-sm">
                    <a href="#" className="font-medium text-gray-500">Travel</a>
                    <span className="text-gray-300">/</span>
                    <a href="#" className="font-medium text-gray-500">Bags</a>
                  </nav>

                  <div className="mt-4">
                    <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Everyday Ruck Snack</h1>
                  </div>

                  <div className="mt-4 flex items-center">
                    <p className="text-lg text-gray-900 sm:text-xl">$220</p>
                    <div className="ml-4 border-l border-gray-300 pl-4 flex items-center">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <StarIcon key={i} className={`h-5 w-5 ${i < 4 ? 'text-yellow-400' : 'text-gray-300'}`} />
                      ))}
                      <p className="ml-2 text-sm text-gray-500">1624 reviews</p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-6">
                    <p className="text-base text-gray-500">
                      Don't compromise on snack-carrying capacity with this lightweight bag.
                    </p>
                  </div>

                  <div className="mt-6 flex items-center">
                    <CheckIcon className="h-5 w-5 text-green-500" />
                    <p className="ml-2 text-sm text-gray-500">In stock and ready to ship</p>
                  </div>
                </div>

                <div className="mt-10 lg:col-start-2 lg:row-span-2 lg:mt-0 lg:self-center">
                  <div className="aspect-square w-full rounded-lg bg-gray-200" />
                </div>

                <div className="mt-10 lg:col-start-1 lg:row-start-2 lg:max-w-lg lg:self-start">
                  <div>
                    <h2 className="text-sm font-medium text-gray-700">Size</h2>
                    <div className="mt-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { name: '18L', desc: 'Perfect for a reasonable amount of snacks.' },
                        { name: '20L', desc: 'Enough room for a large amount of snacks.' }
                      ].map((size) => (
                        <label key={size.name} className="relative flex rounded-lg border border-gray-300 bg-white p-4">
                          <div className="flex-1">
                            <span className="block text-base font-medium text-gray-900">{size.name}</span>
                            <span className="mt-1 block text-sm text-gray-500">{size.desc}</span>
                          </div>
                          <CheckCircleIcon className="h-5 w-5 text-indigo-600" />
                        </label>
                      ))}
                    </div>
                  </div>

                  <button className="mt-10 w-full rounded-md bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700">
                    Add to bag
                  </button>

                  <div className="mt-6 text-center">
                    <a href="#" className="inline-flex text-base font-medium items-center">
                      <ShieldCheckIcon className="mr-2 h-6 w-6 text-gray-400" />
                      <span className="text-gray-500">Lifetime Guarantee</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white">
              <div className="max-w-2xl mx-auto px-8 py-24 lg:max-w-7xl">
                <div className="flex flex-col items-center text-center">
                  <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">The Fine Details</h2>
                  <p className="mt-3 max-w-3xl text-lg text-gray-600">
                    Our patented padded snack sleeve construction protects your treats.
                  </p>
                </div>
                <div className="mt-16 grid lg:grid-cols-2 gap-x-8 gap-y-16">
                  {[1, 2].map((i) => (
                    <div key={i}>
                      <div className="aspect-[3/2] w-full rounded-lg bg-gray-200" />
                      <p className="mt-8 text-base text-gray-500">
                        The 20L model has enough space for 370 candy bars or any combination of treats.
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white">
              <div className="max-w-2xl mx-auto px-8 py-24 lg:max-w-7xl lg:grid lg:grid-cols-12 lg:gap-x-8">
                <div className="lg:col-span-4">
                  <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
                  <div className="mt-3 flex items-center">
                    <div className="flex items-center">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <StarIcon key={i} className={`h-5 w-5 ${i < 4 ? 'text-yellow-400' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    <p className="ml-2 text-sm text-gray-900">Based on 1624 reviews</p>
                  </div>

                  <div className="mt-6 space-y-3">
                    {[
                      { rating: 5, count: 1019, total: 1624 },
                      { rating: 4, count: 162, total: 1624 },
                      { rating: 3, count: 97, total: 1624 },
                    ].map((item) => (
                      <div key={item.rating} className="flex items-center text-sm">
                        <dt className="flex flex-1 items-center">
                          <p className="w-3 font-medium text-gray-900">{item.rating}</p>
                          <div className="ml-1 flex items-center">
                            <StarIcon className={`h-5 w-5 ${item.count > 0 ? 'text-yellow-400' : 'text-gray-300'}`} />
                            <div className="relative ml-3 flex-1">
                              <div className="h-3 rounded-full border border-gray-200 bg-gray-100" />
                              {item.count > 0 && (
                                <div 
                                  style={{ width: `${(item.count / item.total) * 100}%` }}
                                  className="absolute inset-y-0 rounded-full border border-yellow-400 bg-yellow-400"
                                />
                              )}
                            </div>
                          </div>
                        </dt>
                        <dd className="ml-3 w-10 text-right text-sm text-gray-900">
                          {Math.round((item.count / item.total) * 100)}%
                        </dd>
                      </div>
                    ))}
                  </div>

                  <div className="mt-10">
                    <h3 className="text-lg font-medium text-gray-900">Share your thoughts</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      If you've used this product, share your thoughts with other customers
                    </p>
                    <button className="mt-6 w-full rounded-md border border-gray-300 bg-white px-8 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50">
                      Write a review
                    </button>
                  </div>
                </div>

                <div className="mt-16 lg:col-span-7 lg:col-start-6 lg:mt-0">
                  <div className="flow-root">
                    <div className="-my-12 divide-y divide-gray-200">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="py-12">
                          <div className="flex items-center">
                            <div className="w-12 h-12 rounded-full bg-gray-200" />
                            <div className="ml-4">
                              <h4 className="text-sm font-bold text-gray-900">Emily Selman</h4>
                              <div className="mt-1 flex items-center">
                                {[0, 1, 2, 3, 4].map((r) => (
                                  <StarIcon key={r} className={`h-5 w-5 ${r < 5 ? 'text-yellow-400' : 'text-gray-300'}`} />
                                ))}
                              </div>
                            </div>
                          </div>
                          <p className="mt-4 text-base text-gray-600 italic">
                            This is the bag of my dreams. I took it on my vacation and fit an absurd amount of snacks.
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="Product Detail Page - Digital Product with Tabs">
          <div className="bg-white rounded-lg overflow-hidden">
            <div className="flex h-10 items-center justify-center bg-indigo-600 px-4 text-sm font-medium text-white">
              Save 20% when you buy two or more kits
            </div>

            <div className="border-b h-16 flex items-center justify-between px-8">
              <div className="flex items-center gap-8">
                <div className="w-8 h-8 bg-indigo-600 rounded" />
                <div className="flex gap-8 text-sm font-medium text-gray-700">
                  <a href="#">Wireframe Kits</a>
                  <a href="#">Icons</a>
                  <a href="#">UI Kits</a>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <a href="#" className="text-sm font-medium text-gray-700">Sign in</a>
                <span className="h-6 w-px bg-gray-200" />
                <a href="#" className="text-sm font-medium text-gray-700">Create account</a>
                <a href="#" className="text-gray-400 ml-8"><MagnifyingGlassIcon className="h-6 w-6" /></a>
                <a href="#" className="flex items-center gap-2 ml-4">
                  <ShoppingBagIcon className="h-6 w-6 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">0</span>
                </a>
              </div>
            </div>

            <div className="max-w-7xl mx-auto px-8 pt-14 pb-24">
              <div className="lg:grid lg:grid-cols-7 lg:grid-rows-1 lg:gap-x-8 xl:gap-x-16">
                <div className="lg:col-span-4 lg:row-end-1">
                  <div className="aspect-[4/3] w-full rounded-lg bg-gray-200" />
                </div>

                <div className="mt-14 max-w-2xl lg:col-span-3 lg:row-span-2 lg:row-end-2 lg:mt-0 lg:max-w-none">
                  <div className="flex flex-col-reverse">
                    <div className="mt-4">
                      <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Application UI Icon Pack</h1>
                      <p className="mt-2 text-sm text-gray-500">Version 1.0 (Updated June 5, 2021)</p>
                    </div>
                    <div className="flex items-center">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <StarIcon key={i} className={`h-5 w-5 ${i < 4 ? 'text-yellow-400' : 'text-gray-300'}`} />
                      ))}
                    </div>
                  </div>

                  <p className="mt-6 text-gray-500">
                    The Application UI Icon Pack comes with over 200 icons in 3 styles: outline, filled, and branded.
                  </p>

                  <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-4">
                    <button className="w-full rounded-md bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700">
                      Pay $220
                    </button>
                    <button className="w-full rounded-md bg-indigo-50 px-8 py-3 text-base font-medium text-indigo-700 hover:bg-indigo-100">
                      Preview
                    </button>
                  </div>

                  <div className="mt-10 border-t border-gray-200 pt-10">
                    <h3 className="text-sm font-medium text-gray-900">Highlights</h3>
                    <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-gray-500">
                      <li>200+ SVG icons in 3 unique styles</li>
                      <li>Compatible with Figma, Sketch, and Adobe XD</li>
                      <li>Drawn on 24 x 24 pixel grid</li>
                    </ul>
                  </div>

                  <div className="mt-10 border-t border-gray-200 pt-10">
                    <h3 className="text-sm font-medium text-gray-900">License</h3>
                    <p className="mt-4 text-sm text-gray-500">
                      For personal and professional use. <a href="#" className="font-medium text-indigo-600">Read full license</a>
                    </p>
                  </div>

                  <div className="mt-10 border-t border-gray-200 pt-10">
                    <h3 className="text-sm font-medium text-gray-900">Share</h3>
                    <ul className="mt-4 flex items-center space-x-6">
                      <li><a href="#" className="flex h-6 w-6 items-center justify-center text-gray-400"><div className="w-5 h-5 bg-gray-300 rounded" /></a></li>
                      <li><a href="#" className="flex h-6 w-6 items-center justify-center text-gray-400"><div className="w-6 h-6 bg-gray-300 rounded" /></a></li>
                      <li><a href="#" className="flex h-6 w-6 items-center justify-center text-gray-400"><div className="w-5 h-5 bg-gray-300 rounded" /></a></li>
                    </ul>
                  </div>
                </div>

                <div className="mt-16 w-full max-w-2xl lg:col-span-4 lg:mt-0 lg:max-w-none">
                  <div className="border-b border-gray-200">
                    <div className="flex space-x-8 -mb-px">
                      <button className="border-b-2 border-indigo-600 py-6 text-sm font-medium text-indigo-600">
                        Customer Reviews
                      </button>
                      <button className="border-b-2 border-transparent py-6 text-sm font-medium text-gray-700">
                        FAQ
                      </button>
                      <button className="border-b-2 border-transparent py-6 text-sm font-medium text-gray-700">
                        License
                      </button>
                    </div>
                  </div>

                  <div className="-mb-10">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex space-x-4 text-sm text-gray-500">
                        <div className="flex-none py-10">
                          <div className="w-10 h-10 rounded-full bg-gray-100" />
                        </div>
                        <div className={`flex-1 py-10 ${i > 1 ? 'border-t border-gray-200' : ''}`}>
                          <h3 className="font-medium text-gray-900">Emily Selman</h3>
                          <p>July 16, 2021</p>
                          <div className="mt-4 flex items-center">
                            {[0, 1, 2, 3, 4].map((r) => (
                              <StarIcon key={r} className={`h-5 w-5 ${r < 5 ? 'text-yellow-400' : 'text-gray-300'}`} />
                            ))}
                          </div>
                          <p className="mt-4 text-sm text-gray-500">
                            This icon pack is just what I need for my latest project.
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mx-auto mt-24 max-w-2xl lg:max-w-none px-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900">Customers also viewed</h2>
                  <a href="#" className="text-sm font-medium text-indigo-600">View all →</a>
                </div>
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-8">
                  {[
                    { name: 'Fusion', category: 'UI Kit', price: '$49' },
                    { name: 'Marketing Icon Pack', category: 'Icons', price: '$19' },
                    { name: 'Scaffold', category: 'Wireframe Kit', price: '$29' },
                    { name: 'Bones', category: 'Wireframe Kit', price: '$29' },
                  ].map((prod) => (
                    <div key={prod.name} className="group relative">
                      <div className="relative">
                        <div className="aspect-[4/3] w-full rounded-lg bg-gray-100" />
                        <div className="absolute inset-0 flex items-end p-4 opacity-0 group-hover:opacity-100">
                          <div className="w-full rounded-md bg-white/75 px-4 py-2 text-center text-sm font-medium text-gray-900 backdrop-blur-sm">
                            View Product
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between text-base font-medium text-gray-900">
                        <h3>{prod.name}</h3>
                        <p>{prod.price}</p>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">{prod.category}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </ShowcaseSection>
      </div>
    </div>
  );
}