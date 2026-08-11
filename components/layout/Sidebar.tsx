'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/useAuth';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Upload', href: '/upload' },
    { name: 'Chat', href: '/chat' },
    { name: 'Search', href: '/search' },
    { name: 'Timeline', href: '/timeline' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col justify-between">
      <div className="p-6">
        <div className="mb-8">
          <Link href="/dashboard" className="text-xl font-bold text-blue-600">
            MemoryOS App
          </Link>
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      
      <div className="p-6 border-t border-gray-200">
        {user && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Logged In As</p>
            <p className="text-sm font-semibold text-gray-900 truncate">{user.full_name}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
        )}
        <button
          onClick={logout}
          className="w-full bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none"
        >
          Log Out
        </button>
      </div>
    </aside>
  );
};
