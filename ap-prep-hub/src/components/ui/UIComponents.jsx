import React, { forwardRef, useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/helpers';

// Button Component
export const Button = forwardRef(({
  className,
  variant = "primary",
  size = "md",
  children,
  glow, // destructure out to prevent DOM forwarding
  ...props
}, ref) => {
  const baseClasses = "inline-flex items-center justify-center rounded-sm font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-base-950 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-content-primary text-base-950 hover:opacity-90 focus:ring-content-primary",
    secondary: "bg-base-800 hover:bg-base-750 text-content-primary border border-border hover:border-border-strong focus:ring-content-muted",
    ghost: "hover:bg-base-800 text-content-secondary hover:text-content-primary focus:ring-content-muted",
    destructive: "bg-error-500 hover:bg-error-400 text-white focus:ring-error-500",
    outline: "border border-border-strong hover:border-content-muted text-content-secondary hover:text-content-primary bg-transparent hover:bg-base-850 focus:ring-content-muted",
  };

  const sizes = {
    sm: "h-8 px-3 text-xs min-w-[2rem]",
    md: "h-9 px-4 py-2 text-sm min-w-[2.25rem]",
    lg: "h-10 px-5 py-2.5 text-sm min-w-[2.5rem]",
    xl: "h-12 px-6 py-3 text-base min-w-[3rem]",
    icon: "h-8 w-8 p-0"
  };

  return (
    <motion.button
      ref={ref}
      className={cn(baseClasses, variants[variant], sizes[size], className)}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      {children}
    </motion.button>
  );
});

Button.displayName = "Button";

// Card Component
export const Card = forwardRef(({ className, children, glow, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "rounded-md border border-border bg-base-850 transition-colors duration-150",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = "Card";

// CardContent Component
export const CardContent = forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div ref={ref} className={cn("p-6", className)} {...props}>
      {children}
    </div>
  );
});

CardContent.displayName = "CardContent";

// Input Component  
export const Input = forwardRef(({
  className,
  type = "text",
  label,
  icon: Icon,
  multiline = false,
  ...props
}, ref) => {
  const Component = multiline ? 'textarea' : 'input';

  return (
    <div className="relative">
      {Icon && (
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-content-muted z-10">
          <Icon className="w-5 h-5" strokeWidth={1.5} />
        </div>
      )}
      <Component
        type={type}
        ref={ref}
        className={cn(
          "w-full rounded-sm border border-border-strong bg-base-800 px-3 py-2.5 text-content-primary placeholder:text-content-muted transition-colors duration-150 focus:border-content-muted focus:outline-none focus:ring-1 focus:ring-content-muted/20 disabled:cursor-not-allowed disabled:opacity-50",
          Icon && "pl-12",
          multiline && "min-h-[100px] resize-y",
          className
        )}
        placeholder={label}
        {...props}
      />
    </div>
  );
});

Input.displayName = "Input";

// Floating Label Input Component
export const FloatingInput = forwardRef(({
  className,
  type = "text",
  label,
  icon: Icon,
  onFocus: onFocusProp,
  onBlur: onBlurProp,
  onChange: onChangeProp,
  value,
  defaultValue,
  ...props
}, ref) => {
  const [focused, setFocused] = useState(false);
  const [hasValue, setHasValue] = useState(!!value || !!defaultValue);
  const floated = focused || hasValue;

  // Sync hasValue when controlled value changes
  useEffect(() => {
    if (value !== undefined) setHasValue(!!value);
  }, [value]);

  return (
    <div className="relative">
      {Icon && (
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-content-muted z-10">
          <Icon className="w-5 h-5" strokeWidth={1.5} />
        </div>
      )}
      <input
        type={type}
        ref={ref}
        value={value}
        defaultValue={defaultValue}
        className={cn(
          "peer w-full rounded-sm border border-border-strong bg-base-800 px-3 pt-5 pb-1.5 text-content-primary transition-colors duration-150 focus:border-content-muted focus:outline-none focus:ring-1 focus:ring-content-muted/20 disabled:cursor-not-allowed disabled:opacity-50",
          Icon && "pl-12",
          className
        )}
        placeholder=" "
        onFocus={(e) => { setFocused(true); onFocusProp?.(e); }}
        onBlur={(e) => { setFocused(false); setHasValue(!!e.target.value); onBlurProp?.(e); }}
        onChange={(e) => { setHasValue(!!e.target.value); onChangeProp?.(e); }}
        {...props}
      />
      {label && (
        <label
          className={cn(
            "absolute left-3 transition-all duration-200 pointer-events-none",
            Icon && "left-12",
            floated
              ? "top-1.5 text-[10px] text-content-muted"
              : "top-1/2 -translate-y-1/2 text-sm text-content-muted"
          )}
        >
          {label}
        </label>
      )}
    </div>
  );
});

FloatingInput.displayName = "FloatingInput";

// Validated Input — wraps Input with shake on error and checkmark on valid
export const ValidatedInput = forwardRef(({
  error,
  valid,
  className,
  ...props
}, ref) => {
  return (
    <div className="relative">
      <Input
        ref={ref}
        className={cn(
          error && 'animate-shake border-error-500 focus:border-error-500 focus:ring-error-500/20',
          valid && 'border-success-500 focus:border-success-500 focus:ring-success-500/20',
          className
        )}
        {...props}
      />
      {valid && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-success-400 animate-check-pop">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8.5l3.5 3.5L13 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </span>
      )}
      {error && typeof error === 'string' && (
        <p className="mt-1 text-xs text-error-400">{error}</p>
      )}
    </div>
  );
});

ValidatedInput.displayName = "ValidatedInput";

// Badge Component
export const Badge = forwardRef(({
  className,
  variant = "default",
  children,
  ...props
}, ref) => {
  const variants = {
    default: "bg-base-800 text-content-secondary border-border",
    primary: "bg-base-800 text-content-muted border-transparent",
    secondary: "bg-base-800 text-content-secondary border-border",
    success: "bg-success-900 text-success-400 border-transparent",
    warning: "bg-warning-900 text-warning-400 border-transparent",
    destructive: "bg-error-900 text-error-400 border-transparent",
  };

  return (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
});

Badge.displayName = "Badge";

// Avatar Component
export const Avatar = forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

Avatar.displayName = "Avatar";

// AvatarFallback Component
export const AvatarFallback = forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full bg-base-800 text-sm font-medium",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

AvatarFallback.displayName = "AvatarFallback";

// DropdownMenu Components
export const DropdownMenu = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className="relative inline-block text-left">
      {React.Children.map(children, child => {
        if (child.type === DropdownMenuTrigger) {
          return React.cloneElement(child, { onClick: () => setIsOpen(!isOpen) });
        }
        if (child.type === DropdownMenuContent) {
          return isOpen ? React.cloneElement(child, { onClose: () => setIsOpen(false) }) : null;
        }
        return child;
      })}
    </div>
  );
};

export const DropdownMenuTrigger = forwardRef(({ asChild, children, onClick, ...props }, ref) => {
  return React.cloneElement(children, { 
    ref, 
    onClick: (e) => {
      e.stopPropagation();
      onClick?.(e);
    },
    ...props 
  });
});

DropdownMenuTrigger.displayName = "DropdownMenuTrigger";

export const DropdownMenuContent = forwardRef(({ 
  className, 
  children, 
  align = "start",
  onClose,
  ...props 
}, ref) => {
  return (
    <motion.div
      ref={ref}
      className={cn(
        "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border border-border bg-base-800 p-1 text-content-primary shadow-floating",
        align === "end" && "right-0",
        className
      )}
      initial={{ opacity: 0, scale: 0.95, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      transition={{ duration: 0.15 }}
      {...props}
    >
      {React.Children.map(children, child => {
        if (child && child.type === DropdownMenuItem) {
          return React.cloneElement(child, { _onClose: onClose });
        }
        return child;
      })}
    </motion.div>
  );
});

DropdownMenuContent.displayName = "DropdownMenuContent";

export const DropdownMenuItem = forwardRef(({
  className,
  children,
  onSelect,
  onClick,
  _onClose,
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-lg px-3 py-2 text-sm transition-colors hover:bg-base-750 focus:bg-base-750 focus:outline-none text-content-primary",
        className
      )}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(e);
        onSelect?.(e);
        _onClose?.();
      }}
      {...props}
    >
      {children}
    </div>
  );
});

DropdownMenuItem.displayName = "DropdownMenuItem";

export const DropdownMenuSeparator = forwardRef(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("mx-1 my-1 h-px bg-border-strong", className)}
      {...props}
    />
  );
});

DropdownMenuSeparator.displayName = "DropdownMenuSeparator";

// ScrollArea Component
export const ScrollArea = forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("relative overflow-auto", className)}
      {...props}
    >
      {children}
    </div>
  );
});

ScrollArea.displayName = "ScrollArea";

// CardHeader Component
export const CardHeader = forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6 font-display", className)} {...props}>
      {children}
    </div>
  );
});

CardHeader.displayName = "CardHeader";

// CardTitle Component
export const CardTitle = forwardRef(({ className, children, ...props }, ref) => {
  return (
    <h3 ref={ref} className={cn("text-lg font-display font-semibold leading-none tracking-tight text-content-primary", className)} {...props}>
      {children}
    </h3>
  );
});

CardTitle.displayName = "CardTitle";

// Textarea Component
export const Textarea = forwardRef(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[80px] w-full rounded-sm border border-border-strong bg-base-800 px-3 py-2 text-sm text-content-primary placeholder:text-content-muted transition-colors duration-150 focus:border-content-muted focus:outline-none focus:ring-1 focus:ring-content-muted/20 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";

// Progress Component
export const Progress = forwardRef(({ className, value = 0, max = 100, ...props }, ref) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  return (
    <div
      ref={ref}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-base-800",
        className
      )}
      {...props}
    >
      <div
        className="h-full w-full flex-1 bg-content-primary transition-all duration-300 ease-in-out"
        style={{ transform: `translateX(-${100 - percentage}%)` }}
      />
    </div>
  );
});

Progress.displayName = "Progress";
