import React from "react";
import { cn } from "@/lib/utils";
import { Search, Eye, EyeOff, Calendar, Check } from "lucide-react";

// Base input styles - Using design tokens
const inputBase = cn(
  "w-full px-[var(--spacing-4)] py-[var(--spacing-2)] rounded-[var(--radius-lg)]",
  "bg-[var(--color-input-background)] border border-[var(--color-border)]",
  "font-[var(--font-family-body)] text-[var(--text-base)] text-[var(--color-text-body)] placeholder:text-[var(--color-text-muted)]",
  "transition-all duration-[var(--duration-200)]",
  "focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)] focus:border-[var(--color-primary)]",
  "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-[var(--color-muted)]"
);

const labelBase = "block font-[var(--font-family-display)] text-[var(--text-sm)] font-[var(--font-weight-medium)] tracking-[var(--tracking-airy)] text-[var(--color-text-secondary)] mb-[var(--spacing-2)]";
const errorBase = "font-[var(--font-family-body)] text-[var(--text-sm)] text-[var(--color-destructive)] mt-[var(--spacing-1)]";
const hintBase = "font-[var(--font-family-body)] text-[var(--text-sm)] text-[var(--color-text-muted)] mt-[var(--spacing-1)]";

// Text Field
export function TextField({ 
  label, 
  placeholder, 
  value, 
  onChange, 
  error,
  hint,
  required,
  disabled,
  className, 
  ...props 
}) {
  return (
    <div className={className}>
      {label && (
        <label className={labelBase}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      <input
        type="text"
        className={cn(inputBase, error && "border-destructive focus:ring-destructive/30")}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        {...props}
      />
      {error && <p className={errorBase}>{error}</p>}
      {hint && !error && <p className={hintBase}>{hint}</p>}
    </div>
  );
}

// TextArea Field
export function TextAreaField({ 
  label, 
  placeholder, 
  value, 
  onChange, 
  rows = 4,
  error,
  hint,
  required,
  disabled,
  className, 
  ...props 
}) {
  return (
    <div className={className}>
      {label && (
        <label className={labelBase}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      <textarea
        className={cn(inputBase, "resize-none", error && "border-[#8b5b5b] focus:ring-[#8b5b5b]/30")}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        rows={rows}
        disabled={disabled}
        {...props}
      />
      {error && <p className={errorBase}>{error}</p>}
      {hint && !error && <p className={hintBase}>{hint}</p>}
    </div>
  );
}

// Select Field
export function SelectField({ 
  label, 
  options = [], 
  value, 
  onChange, 
  placeholder = "Select an option",
  error,
  hint,
  required,
  disabled,
  className, 
  ...props 
}) {
  return (
    <div className={className}>
      {label && (
        <label className={labelBase}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      <select
        className={cn(
          inputBase, 
          "appearance-none cursor-pointer",
          "bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236d6d6d%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')]",
          "bg-[position:right_12px_center] bg-no-repeat bg-[length:18px]",
          error && "border-[#8b5b5b] focus:ring-[#8b5b5b]/30"
        )}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        {...props}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map((option, i) => (
          <option key={i} value={typeof option === "string" ? option : option.value}>
            {typeof option === "string" ? option : option.label}
          </option>
        ))}
      </select>
      {error && <p className={errorBase}>{error}</p>}
      {hint && !error && <p className={hintBase}>{hint}</p>}
    </div>
  );
}

// Checkbox Field - Using design tokens
export function CheckboxField({ 
  label, 
  checked, 
  onChange, 
  description,
  disabled,
  className, 
  ...props 
}) {
  return (
    <label className={cn("flex items-start gap-[var(--spacing-3)] cursor-pointer", disabled && "opacity-50 cursor-not-allowed", className)}>
      <div className="relative mt-[var(--spacing-1)]">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange?.(e.target.checked)}
          disabled={disabled}
          {...props}
        />
        <div className={cn(
          "w-5 h-5 rounded-[var(--radius-sm)] border-2 transition-all duration-[var(--duration-200)]",
          "flex items-center justify-center",
          checked 
            ? "bg-[var(--color-primary)] border-[var(--color-primary)]" 
            : "bg-white border-[var(--color-border)] hover:border-[var(--color-primary)]"
        )}>
          {checked && <Check className="h-3 w-3 text-white" />}
        </div>
      </div>
      <div>
        <span className="font-[var(--font-family-display)] text-[var(--text-sm)] font-[var(--font-weight-medium)] tracking-[var(--tracking-airy)] text-[var(--color-text-secondary)]">{label}</span>
        {description && <p className="font-[var(--font-family-body)] text-[var(--text-sm)] text-[var(--color-text-muted)] mt-[var(--spacing-1)] leading-[var(--leading-normal)]">{description}</p>}
      </div>
    </label>
  );
}

// Radio Field
export function RadioField({ 
  label, 
  options = [], 
  value, 
  onChange, 
  disabled,
  className, 
  ...props 
}) {
  return (
    <div className={className}>
      {label && <p className={labelBase}>{label}</p>}
      <div className="space-y-2">
        {options.map((option, i) => {
          const optionValue = typeof option === "string" ? option : option.value;
          const optionLabel = typeof option === "string" ? option : option.label;
          const isSelected = value === optionValue;
          
          return (
            <label key={i} className={cn("flex items-center gap-3 cursor-pointer", disabled && "opacity-50 cursor-not-allowed")}>
              <div className="relative">
                <input
                  type="radio"
                  className="sr-only"
                  checked={isSelected}
                  onChange={() => onChange?.(optionValue)}
                  disabled={disabled}
                  {...props}
                />
                <div className={cn(
                  "w-5 h-5 rounded-full border-2 transition-all duration-200",
                  "flex items-center justify-center",
                  isSelected 
                    ? "border-primary" 
                    : "border-border hover:border-primary"
                )}>
                  {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                </div>
              </div>
              <span className="text-sm text-charcoal">{optionLabel}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

// Switch Field - Using design tokens
export function SwitchField({ 
  label, 
  checked, 
  onChange, 
  description,
  disabled,
  className, 
  ...props 
}) {
  return (
    <label className={cn("flex items-start justify-between gap-[var(--spacing-4)] cursor-pointer", disabled && "opacity-50 cursor-not-allowed", className)}>
      <div>
        <span className="font-[var(--font-family-display)] text-[var(--text-sm)] font-[var(--font-weight-medium)] tracking-[var(--tracking-airy)] text-[var(--color-text-secondary)]">{label}</span>
        {description && <p className="font-[var(--font-family-body)] text-[var(--text-sm)] text-[var(--color-text-muted)] mt-[var(--spacing-1)] leading-[var(--leading-normal)]">{description}</p>}
      </div>
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange?.(e.target.checked)}
          disabled={disabled}
          {...props}
        />
        <div className={cn(
          "w-11 h-6 rounded-full transition-all duration-[var(--duration-200)]",
          checked ? "bg-[var(--color-primary)]" : "bg-[var(--color-switch-background)]"
        )}>
          <div className={cn(
            "w-5 h-5 rounded-full bg-white shadow-[var(--shadow-sm)] transition-all duration-[var(--duration-200)]",
            "absolute top-0.5",
            checked ? "left-[22px]" : "left-0.5"
          )} />
        </div>
      </div>
    </label>
  );
}

// Search Field
export function SearchField({ 
  placeholder = "Search...", 
  value, 
  onChange, 
  onSubmit,
  disabled,
  className, 
  ...props 
}) {
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && onSubmit) {
      onSubmit(value);
    }
  };

  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
      <input
        type="search"
        className={cn(inputBase, "pl-10")}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        {...props}
      />
    </div>
  );
}

// Email Field
export function EmailField({ 
  label, 
  placeholder = "email@example.com", 
  value, 
  onChange, 
  error,
  required,
  disabled,
  className, 
  ...props 
}) {
  return (
    <div className={className}>
      {label && (
        <label className={labelBase}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      <input
        type="email"
        className={cn(inputBase, error && "border-destructive focus:ring-destructive/30")}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        {...props}
      />
      {error && <p className={errorBase}>{error}</p>}
    </div>
  );
}

// Password Field
export function PasswordField({ 
  label, 
  placeholder = "••••••••", 
  value, 
  onChange, 
  error,
  required,
  disabled,
  className, 
  ...props 
}) {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <div className={className}>
      {label && (
        <label className={labelBase}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          className={cn(inputBase, "pr-10", error && "border-[#8b5b5b] focus:ring-[#8b5b5b]/30")}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          {...props}
        />
        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-charcoal"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
      {error && <p className={errorBase}>{error}</p>}
    </div>
  );
}

// Date Picker Field
export function DatePickerField({ 
  label, 
  value, 
  onChange, 
  error,
  required,
  disabled,
  className, 
  ...props 
}) {
  return (
    <div className={className}>
      {label && (
        <label className={labelBase}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          type="date"
          className={cn(inputBase, error && "border-destructive focus:ring-destructive/30")}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          {...props}
        />
        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
      </div>
      {error && <p className={errorBase}>{error}</p>}
    </div>
  );
}

export default {
  TextField,
  TextAreaField,
  SelectField,
  CheckboxField,
  RadioField,
  SwitchField,
  SearchField,
  EmailField,
  PasswordField,
  DatePickerField,
};