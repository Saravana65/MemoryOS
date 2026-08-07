'use client';

import React from 'react';
import { useAuth } from '@/lib/auth/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Welcome back to your personal knowledge vault.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-bold text-gray-900">User Session Information</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-2xl">
              {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900">{user?.full_name}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Account ID</span>
              <p className="text-sm text-gray-700 font-mono select-all truncate">{user?.id}</p>
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Current Plan</span>
              <p className="text-sm text-gray-700 font-medium">{user?.plan || 'Free Tier'}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button variant="danger" onClick={logout}>
            Log Out
          </Button>
        </CardFooter>
      </Card>
      
      <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-md">
        <h3 className="text-blue-800 font-semibold mb-1">Upload & Chat Modules Coming Soon</h3>
        <p className="text-sm text-blue-700">
          In the next phases of development, you will be able to upload PDF/text documents, perform similarity semantic searches, and interact with your private knowledge base using RAG-powered chat interfaces.
        </p>
      </div>
    </div>
  );
}
