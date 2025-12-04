import React from "react";
import { cn } from "@/lib/utils";

// Base styles using Sturij design tokens
const headingBase = "font-light tracking-tight text-[#1b2a35]";
const bodyBase = "text-[#3b3b3b] leading-relaxed";

// H1 - Main page titles
export function H1({ children, className, ...props }) {
  return (
    <h1 
      className={cn(
        headingBase,
        "text-4xl md:text-5xl lg:text-6xl",
        className
      )} 
      style={{ fontFamily: 'var(--font-heading, "Degular Display Light", system-ui, sans-serif)' }}
      {...props}
    >
      {children}
    </h1>
  );
}

// H2 - Section headings
export function H2({ children, className, ...props }) {
  return (
    <h2 
      className={cn(
        headingBase,
        "text-3xl md:text-4xl",
        className
      )} 
      style={{ fontFamily: 'var(--font-heading, "Degular Display Light", system-ui, sans-serif)' }}
      {...props}
    >
      {children}
    </h2>
  );
}

// H3 - Subsection headings
export function H3({ children, className, ...props }) {
  return (
    <h3 
      className={cn(
        headingBase,
        "text-2xl md:text-3xl",
        className
      )} 
      style={{ fontFamily: 'var(--font-heading, "Degular Display Light", system-ui, sans-serif)' }}
      {...props}
    >
      {children}
    </h3>
  );
}

// H4 - Card titles, smaller sections
export function H4({ children, className, ...props }) {
  return (
    <h4 
      className={cn(
        headingBase,
        "text-xl md:text-2xl",
        className
      )} 
      style={{ fontFamily: 'var(--font-heading, "Degular Display Light", system-ui, sans-serif)' }}
      {...props}
    >
      {children}
    </h4>
  );
}

// H5 - Small headings
export function H5({ children, className, ...props }) {
  return (
    <h5 
      className={cn(
        headingBase,
        "text-lg md:text-xl",
        className
      )} 
      style={{ fontFamily: 'var(--font-heading, "Degular Display Light", system-ui, sans-serif)' }}
      {...props}
    >
      {children}
    </h5>
  );
}

// H6 - Smallest headings
export function H6({ children, className, ...props }) {
  return (
    <h6 
      className={cn(
        headingBase,
        "text-base md:text-lg font-medium",
        className
      )} 
      style={{ fontFamily: 'var(--font-heading, "Degular Display Light", system-ui, sans-serif)' }}
      {...props}
    >
      {children}
    </h6>
  );
}

// Body Text - Main content
export function BodyText({ children, className, ...props }) {
  return (
    <p 
      className={cn(bodyBase, "text-base", className)} 
      style={{ fontFamily: 'var(--font-body, "Mrs Eaves XL Serif", Georgia, serif)' }}
      {...props}
    >
      {children}
    </p>
  );
}

// Muted Text - Secondary content
export function MutedText({ children, className, ...props }) {
  return (
    <p 
      className={cn("text-[#6d6d6d] text-sm leading-relaxed", className)} 
      style={{ fontFamily: 'var(--font-body, "Mrs Eaves XL Serif", Georgia, serif)' }}
      {...props}
    >
      {children}
    </p>
  );
}

// Small Text - Captions, labels
export function SmallText({ children, className, ...props }) {
  return (
    <span 
      className={cn("text-[#3b3b3b] text-xs leading-normal", className)} 
      style={{ fontFamily: 'var(--font-body, "Mrs Eaves XL Serif", Georgia, serif)' }}
      {...props}
    >
      {children}
    </span>
  );
}

// Large Text - Emphasized body text
export function LargeText({ children, className, ...props }) {
  return (
    <p 
      className={cn(bodyBase, "text-lg md:text-xl", className)} 
      style={{ fontFamily: 'var(--font-body, "Mrs Eaves XL Serif", Georgia, serif)' }}
      {...props}
    >
      {children}
    </p>
  );
}

// Code Text - Inline code
export function CodeText({ children, className, ...props }) {
  return (
    <code 
      className={cn(
        "bg-[#eceae5] text-[#4A5D4E] px-1.5 py-0.5 rounded text-sm font-mono",
        className
      )} 
      {...props}
    >
      {children}
    </code>
  );
}

// Link Text - Styled links
export function LinkText({ children, href, className, ...props }) {
  return (
    <a 
      href={href}
      className={cn(
        "text-[#4A5D4E] hover:text-[#3a4a3e] underline underline-offset-2 transition-colors duration-200",
        className
      )} 
      style={{ fontFamily: 'var(--font-body, "Mrs Eaves XL Serif", Georgia, serif)' }}
      {...props}
    >
      {children}
    </a>
  );
}

// Caption - Image captions, footnotes
export function Caption({ children, className, ...props }) {
  return (
    <figcaption 
      className={cn("text-[#6d6d6d] text-xs italic leading-normal", className)} 
      style={{ fontFamily: 'var(--font-body, "Mrs Eaves XL Serif", Georgia, serif)' }}
      {...props}
    >
      {children}
    </figcaption>
  );
}

export default {
  H1, H2, H3, H4, H5, H6,
  BodyText, MutedText, SmallText, LargeText,
  CodeText, LinkText, Caption
};