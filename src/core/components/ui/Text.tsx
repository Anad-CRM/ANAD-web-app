import React from 'react';
import { clsx } from 'clsx';

interface TextProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  as?: React.ElementType;
  className?: string;
  weight?: "extraLight" | 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | 'custom';
}

const weightClasses = {
  extraLight: 'font-extralight',
  light: 'font-light',
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
};

const sizeClasses = {
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
  'custom': '', 
};

export function Text({
  children,
  as: Component = 'span',
  className,
  weight = 'normal',
  size = 'base',
  style,
  ...props
}: TextProps) {
  return (
    <Component
      className={clsx(sizeClasses[size], weightClasses[weight], className)}
      style={{ fontFamily: '"Roboto", sans-serif', ...style }}
      {...props}
    >
      {children}
    </Component>
  );
}