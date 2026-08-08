import React from 'react';
import { Navbar } from '@/components/layout/Navbar';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink">
      <Navbar />
      <main className="flex-grow flex flex-col">{children}</main>
      <footer className="bg-paper border-t border-linen py-8 text-center text-sm text-sage/80">
        &copy; {new Date().getFullYear()} MemoryOS. Built for individuals.
      </footer>
    </div>
  );
}
