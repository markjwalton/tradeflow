import React from 'react';
import { Facebook, Instagram, Github, Youtube } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Footer with social media links
 * Based on Tailwind UI simple centered footer pattern
 */
export function TailwindFooter({ 
  socialLinks = [],
  copyrightText = "© 2024 Your Company, Inc. All rights reserved.",
  className 
}) {
  const defaultSocialLinks = [
    { name: 'Facebook', href: '#', icon: Facebook },
    { name: 'Instagram', href: '#', icon: Instagram },
    { name: 'X', href: '#', icon: (props) => (
      <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
        <path d="M13.6823 10.6218L20.2391 3H18.6854L12.9921 9.61788L8.44486 3H3.2002L10.0765 13.0074L3.2002 21H4.75404L10.7663 14.0113L15.5685 21H20.8131L13.6819 10.6218H13.6823ZM11.5541 13.0956L10.8574 12.0991L5.31391 4.16971H7.70053L12.1742 10.5689L12.8709 11.5655L18.6861 19.8835H16.2995L11.5541 13.096V13.0956Z" />
      </svg>
    ) },
    { name: 'GitHub', href: '#', icon: Github },
    { name: 'YouTube', href: '#', icon: Youtube },
  ];

  const links = socialLinks.length > 0 ? socialLinks : defaultSocialLinks;

  return (
    <footer className={cn("bg-card border-t", className)}>
      <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
        <div className="flex justify-center gap-x-6 md:order-2">
          {links.map((item) => {
            const IconComponent = item.icon;
            return (
              <a 
                key={item.name} 
                href={item.href} 
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <span className="sr-only">{item.name}</span>
                <IconComponent className="size-6" aria-hidden="true" />
              </a>
            );
          })}
        </div>
        <p className="mt-8 text-center text-sm/6 text-muted-foreground md:order-1 md:mt-0">
          {copyrightText}
        </p>
      </div>
    </footer>
  );
}