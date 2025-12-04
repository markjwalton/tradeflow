import React from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, ArrowRight } from "lucide-react";

// Base card styles
const cardBase = cn(
  "bg-white rounded-xl",
  "border border-[#eceae5]",
  "transition-all duration-200"
);

// Basic Card - Simple container
export function BasicCard({ 
  title, 
  description, 
  children, 
  className, 
  ...props 
}) {
  return (
    <div className={cn(cardBase, "p-6", className)} {...props}>
      {title && (
        <h3 
          className="text-lg font-light text-[#1b2a35] mb-1"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          {title}
        </h3>
      )}
      {description && (
        <p className="text-sm text-[#6d6d6d] mb-4">{description}</p>
      )}
      {children}
    </div>
  );
}

// Action Card - Card with hover effect and click action
export function ActionCard({ 
  title, 
  description, 
  icon,
  onClick, 
  className, 
  ...props 
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        cardBase,
        "p-6 w-full text-left",
        "hover:shadow-lg hover:border-[#4A5D4E]/20",
        "hover:-translate-y-0.5",
        "focus:outline-none focus:ring-2 focus:ring-[#4A5D4E]/50 focus:ring-offset-2",
        "group",
        className
      )}
      {...props}
    >
      <div className="flex items-start gap-4">
        {icon && (
          <div className="p-2 rounded-lg bg-[#4A5D4E]/10 text-[#4A5D4E] group-hover:bg-[#4A5D4E] group-hover:text-white transition-colors">
            {icon}
          </div>
        )}
        <div className="flex-1">
          <h3 
            className="text-lg font-light text-[#1b2a35] mb-1"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {title}
          </h3>
          {description && (
            <p className="text-sm text-[#6d6d6d]">{description}</p>
          )}
        </div>
        <ArrowRight className="h-5 w-5 text-[#6d6d6d] group-hover:text-[#4A5D4E] group-hover:translate-x-1 transition-all" />
      </div>
    </button>
  );
}

// Feature Card - Highlight a feature
export function FeatureCard({ 
  title, 
  description, 
  icon,
  highlight = false,
  className, 
  ...props 
}) {
  return (
    <div
      className={cn(
        cardBase,
        "p-6",
        highlight && "border-[#4A5D4E] bg-[#4A5D4E]/5",
        className
      )}
      {...props}
    >
      {icon && (
        <div className={cn(
          "inline-flex p-3 rounded-lg mb-4",
          highlight ? "bg-[#4A5D4E] text-white" : "bg-[#D4A574]/20 text-[#D4A574]"
        )}>
          {icon}
        </div>
      )}
      <h3 
        className="text-xl font-light text-[#1b2a35] mb-2"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        {title}
      </h3>
      {description && (
        <p className="text-[#6d6d6d]" style={{ fontFamily: 'var(--font-body)' }}>
          {description}
        </p>
      )}
    </div>
  );
}

// Stats Card - Display a statistic
export function StatsCard({ 
  label, 
  value, 
  change, 
  icon,
  trend,
  className, 
  ...props 
}) {
  const isPositive = change > 0 || trend === "up";
  const isNegative = change < 0 || trend === "down";

  return (
    <div className={cn(cardBase, "p-6", className)} {...props}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[#6d6d6d] mb-1">{label}</p>
          <p 
            className="text-3xl font-light text-[#1b2a35]"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {value}
          </p>
          {change !== undefined && (
            <div className={cn(
              "flex items-center gap-1 mt-2 text-sm",
              isPositive && "text-[#5a7a5e]",
              isNegative && "text-[#8b5b5b]",
              !isPositive && !isNegative && "text-[#6d6d6d]"
            )}>
              {isPositive && <TrendingUp className="h-4 w-4" />}
              {isNegative && <TrendingDown className="h-4 w-4" />}
              <span>{isPositive ? "+" : ""}{change}%</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="p-3 rounded-lg bg-[#f5f3ef] text-[#4A5D4E]">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

// Product Card - E-commerce style
export function ProductCard({ 
  image, 
  title, 
  price, 
  originalPrice,
  badge,
  onClick,
  className, 
  ...props 
}) {
  return (
    <div 
      className={cn(
        cardBase, 
        "overflow-hidden cursor-pointer group",
        "hover:shadow-lg hover:-translate-y-0.5",
        className
      )} 
      onClick={onClick}
      {...props}
    >
      <div className="relative aspect-square bg-[#f5f3ef] overflow-hidden">
        {image && (
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        )}
        {badge && (
          <span className="absolute top-3 left-3 px-2 py-1 text-xs font-medium bg-[#D4A574] text-white rounded">
            {badge}
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 
          className="text-base font-medium text-[#1b2a35] mb-2 line-clamp-2"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          {title}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-[#4A5D4E]">{price}</span>
          {originalPrice && (
            <span className="text-sm text-[#6d6d6d] line-through">{originalPrice}</span>
          )}
        </div>
      </div>
    </div>
  );
}

// Profile Card - User profile display
export function ProfileCard({ 
  avatar, 
  name, 
  role, 
  bio,
  actions,
  className, 
  ...props 
}) {
  return (
    <div className={cn(cardBase, "p-6 text-center", className)} {...props}>
      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#d9b4a7] overflow-hidden">
        {avatar ? (
          <img src={avatar} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl font-light text-white">
            {name?.charAt(0)?.toUpperCase()}
          </div>
        )}
      </div>
      <h3 
        className="text-xl font-light text-[#1b2a35] mb-1"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        {name}
      </h3>
      {role && (
        <p className="text-sm text-[#D4A574] mb-3">{role}</p>
      )}
      {bio && (
        <p className="text-sm text-[#6d6d6d] mb-4" style={{ fontFamily: 'var(--font-body)' }}>
          {bio}
        </p>
      )}
      {actions && (
        <div className="flex justify-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}

// Testimonial Card - Customer quote
export function TestimonialCard({ 
  quote, 
  author, 
  role, 
  avatar,
  rating,
  className, 
  ...props 
}) {
  return (
    <div className={cn(cardBase, "p-6", className)} {...props}>
      {rating && (
        <div className="flex gap-1 mb-4">
          {[...Array(5)].map((_, i) => (
            <svg 
              key={i} 
              className={cn("h-5 w-5", i < rating ? "text-[#D4A574]" : "text-[#eceae5]")}
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
      )}
      <blockquote 
        className="text-[#3b3b3b] mb-4 italic"
        style={{ fontFamily: 'var(--font-body)' }}
      >
        "{quote}"
      </blockquote>
      <div className="flex items-center gap-3">
        {avatar ? (
          <img src={avatar} alt={author} className="w-10 h-10 rounded-full object-cover" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-[#d9b4a7] flex items-center justify-center text-sm font-medium text-white">
            {author?.charAt(0)?.toUpperCase()}
          </div>
        )}
        <div>
          <p className="font-medium text-[#1b2a35]">{author}</p>
          {role && <p className="text-sm text-[#6d6d6d]">{role}</p>}
        </div>
      </div>
    </div>
  );
}

// Image Card - Card with prominent image
export function ImageCard({ 
  image, 
  title, 
  description, 
  overlay = false,
  onClick,
  className, 
  ...props 
}) {
  return (
    <div 
      className={cn(
        cardBase, 
        "overflow-hidden cursor-pointer group",
        "hover:shadow-lg",
        className
      )} 
      onClick={onClick}
      {...props}
    >
      <div className="relative aspect-video bg-[#f5f3ef] overflow-hidden">
        {image && (
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        )}
        {overlay && (
          <div className="absolute inset-0 bg-gradient-to-t from-[#1b2a35]/80 to-transparent" />
        )}
        {overlay && title && (
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <h3 className="text-lg font-light" style={{ fontFamily: 'var(--font-heading)' }}>
              {title}
            </h3>
            {description && (
              <p className="text-sm opacity-90 line-clamp-2">{description}</p>
            )}
          </div>
        )}
      </div>
      {!overlay && (title || description) && (
        <div className="p-4">
          {title && (
            <h3 
              className="text-lg font-light text-[#1b2a35] mb-1"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-[#6d6d6d] line-clamp-2">{description}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default {
  BasicCard,
  ActionCard,
  FeatureCard,
  StatsCard,
  ProductCard,
  ProfileCard,
  TestimonialCard,
  ImageCard,
};