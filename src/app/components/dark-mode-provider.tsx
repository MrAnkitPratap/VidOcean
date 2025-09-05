'use client';

import { useEffect } from 'react';

export function DarkModeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Force dark mode on page load
    document.documentElement.classList.add('dark');
  }, []);

  return <>{children}</>;
}
