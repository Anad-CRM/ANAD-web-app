import React from 'react';
import { clsx, type ClassValue } from 'clsx';

interface TextProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  as?: React.ElementType;
  className?: string;
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | 'custom';
}

const weightClasses = {
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
  'custom': '', // Allows overriding size through className
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