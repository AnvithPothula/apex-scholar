import React, { forwardRef, useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/helpers';

// Button Component
export const Button = forwardRef(({ 
  className, 
  variant = "primary", 
  size = "md", 
  children, 
  glow = false,
  gradient = false,
  ...props 
}, ref) => {
  const baseClasses = "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: gradient 
      ? "bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl focus:ring-blue-500"
      : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl focus:ring-blue-500",
    secondary: "bg-slate-800/80 backdrop-blur-sm hover:bg-slate-700 text-slate-200 border border-slate-600 hover:border-slate-500 shadow-md hover:shadow-lg focus:ring-slate-500",
    ghost: "hover:bg-slate-800 text-slate-300 hover:text-slate-100 focus:ring-slate-500",
    destructive: "bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl focus:ring-red-500",
    outline: "border-2 border-slate-600 hover:border-slate-500 text-slate-300 hover:text-slate-100 bg-transparent hover:bg-slate-800 focus:ring-slate-500",
    purple: "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl focus:ring-purple-500"
  };

  const sizes = {
    sm: "h-9 px-3 text-xs min-w-[2.25rem]", // Better touch target for mobile
    md: "h-10 px-4 py-2 text-sm min-w-[2.5rem]",
    lg: "h-12 px-6 py-3 text-base min-w-[3rem]",
    xl: "h-14 px-8 py-4 text-lg min-w-[3.5rem]"
  };

  const glowEffect = glow ? "hover:shadow-2xl hover:shadow-blue-500/25" : "";

  return (
    <motion.button
      ref={ref}
      className={cn(baseClasses, variants[variant], sizes[size], glowEffect, className)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      {children}
    </motion.button>
  );
});

Button.displayName = "Button";

// Card Component
export const Card = forwardRef(({ className, glow = false, children, ...props }, ref) => {
  const glowEffect = glow ? "shadow-2xl shadow-blue-500/10" : "";
  
  return (
    <motion.div
      ref={ref}
      className={cn(
        "rounded-2xl border border-slate-700 bg-slate-800/80 backdrop-blur-xl shadow-lg transition-all duration-300",
        glowEffect,
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      {...props}
    >
      {children}
    </motion.div>
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
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 z-10">
          <Icon className="w-5 h-5" />
        </div>
      )}
      <Component
        type={type}
        ref={ref}
        className={cn(
          "w-full rounded-xl border border-slate-600 bg-slate-800/90 backdrop-blur-sm px-4 py-3 text-slate-100 placeholder-slate-400 shadow-sm transition-all duration-300 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50",
          Icon && "pl-12",
          multiline && "min-h-[100px] resize-y",
          className
        )}
        placeholder={label}
        {...props}
      />
      {label && (
        <motion.label
          className="absolute left-4 top-3 text-slate-400 text-sm transition-all duration-200 pointer-events-none"
          initial={false}
          animate={{
            top: props.value || props.defaultValue ? "0.5rem" : "0.75rem",
            fontSize: props.value || props.defaultValue ? "0.75rem" : "0.875rem",
            color: props.value || props.defaultValue ? "#3b82f6" : "#94a3b8"
          }}
        >
          {label}
        </motion.label>
      )}
    </div>
  );
});

Input.displayName = "Input";

// Badge Component
export const Badge = forwardRef(({ 
  className, 
  variant = "default", 
  children, 
  ...props 
}, ref) => {
  const variants = {
    default: "bg-slate-700 text-slate-200 border-slate-600",
    primary: "bg-blue-700 text-blue-200 border-blue-600",
    secondary: "bg-gray-700 text-gray-200 border-gray-600", 
    success: "bg-green-700 text-green-200 border-green-600",
    warning: "bg-yellow-700 text-yellow-200 border-yellow-600",
    destructive: "bg-red-700 text-red-200 border-red-600",
    purple: "bg-purple-700 text-purple-200 border-purple-600"
  };

  return (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2",
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
        "flex h-full w-full items-center justify-center rounded-full bg-slate-100 text-slate-600 text-sm font-medium",
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
        "absolute z-50 min-w-[8rem] overflow-hidden rounded-xl border border-slate-600 bg-slate-800/95 backdrop-blur-sm p-1 text-slate-100 shadow-lg",
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
        if (child.type === DropdownMenuItem) {
          return React.cloneElement(child, { 
            onClick: (e) => {
              e.stopPropagation();
              child.props.onSelect?.(e);
              onClose?.();
            }
          });
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
  ...props 
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-lg px-3 py-2 text-sm transition-colors hover:bg-slate-700 focus:bg-slate-700 focus:outline-none text-slate-200",
        className
      )}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(e);
        onSelect?.(e);
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
      className={cn("mx-1 my-1 h-px bg-slate-600", className)}
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
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props}>
      {children}
    </div>
  );
});

CardHeader.displayName = "CardHeader";

// CardTitle Component
export const CardTitle = forwardRef(({ className, children, ...props }, ref) => {
  return (
    <h3 ref={ref} className={cn("text-2xl font-semibold leading-none tracking-tight", className)} {...props}>
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
        "flex min-h-[80px] w-full rounded-xl border border-slate-200 bg-white/90 backdrop-blur-sm px-3 py-2 text-sm text-slate-900 placeholder-slate-500 shadow-sm transition-all duration-300 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";
