import { useState } from 'react';
import { Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Logo } from './Logo';
import { PlusGrid, PlusGridItem, PlusGridRow } from './PlusGrid';

const links = [
  { href: 'RadiantPricing', label: 'Pricing' },
  { href: 'RadiantCompany', label: 'Company' },
  { href: 'RadiantBlog', label: 'Blog' },
  { href: 'RadiantLogin', label: 'Login' },
];

function DesktopNav() {
  return (
    <nav className="relative hidden lg:flex">
      {links.map(({ href, label }) => (
        <PlusGridItem key={href} className="relative flex">
          <Link
            to={createPageUrl(href)}
            className="flex items-center px-4 py-3 text-base font-medium text-gray-950 bg-blend-multiply hover:bg-black/[0.025] transition-colors"
          >
            {label}
          </Link>
        </PlusGridItem>
      ))}
    </nav>
  );
}

function MobileNavButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex size-12 items-center justify-center self-center rounded-lg hover:bg-black/5 lg:hidden transition-colors"
      aria-label="Open main menu"
    >
      <Menu className="size-6" />
    </button>
  );
}

function MobileNav({ isOpen }) {
  if (!isOpen) return null;

  return (
    <div className="lg:hidden">
      <div className="flex flex-col gap-6 py-4">
        {links.map(({ href, label }, linkIndex) => (
          <motion.div
            initial={{ opacity: 0, rotateX: -90 }}
            animate={{ opacity: 1, rotateX: 0 }}
            transition={{
              duration: 0.15,
              ease: 'easeInOut',
              rotateX: { duration: 0.3, delay: linkIndex * 0.1 },
            }}
            key={href}
          >
            <Link 
              to={createPageUrl(href)} 
              className="text-base font-medium text-gray-950"
            >
              {label}
            </Link>
          </motion.div>
        ))}
      </div>
      <div className="absolute left-1/2 w-screen -translate-x-1/2">
        <div className="absolute inset-x-0 top-0 border-t border-black/5" />
        <div className="absolute inset-x-0 top-2 border-t border-black/5" />
      </div>
    </div>
  );
}

export function Navbar({ banner }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="pt-12 sm:pt-16">
      <PlusGrid>
        <PlusGridRow className="relative flex justify-between">
          <div className="relative flex gap-6">
            <PlusGridItem className="py-3">
              <Link to={createPageUrl('RadiantHome')} title="Home">
                <Logo className="h-9" />
              </Link>
            </PlusGridItem>
            {banner && (
              <div className="relative hidden items-center py-3 lg:flex">
                {banner}
              </div>
            )}
          </div>
          <DesktopNav />
          <MobileNavButton onClick={() => setMobileMenuOpen(!mobileMenuOpen)} />
        </PlusGridRow>
      </PlusGrid>
      <MobileNav isOpen={mobileMenuOpen} />
    </header>
  );
}