import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'strong';
}

export function GlassCard({ children, className = '', variant = 'default' }: GlassCardProps) {
  const baseClasses = 'rounded-2xl shadow-xl';
  const variantClasses = variant === 'default' ? 'glass' : 'glass-strong';
  
  return (
    <div className={`${baseClasses} ${variantClasses} ${className}`}>
      {children}
    </div>
  );
}
