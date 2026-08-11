'use client';

import React, { useState, useEffect } from 'react';
import { getFiles } from '@/lib/api/files';
import { Document } from '@/lib/types/document';
import { TimelineView } from '@/components/timeline/TimelineView';

export default function TimelinePage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDocuments = async () => {
    try {
      const data = await getFiles(1, 100);
      setDocuments(data.items);
    } catch (err) {
      console.error('Failed to load timeline documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-[#4F6D60] mb-3" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p className="text-sm text-gray-500 font-sans font-medium">Reconstructing timeline history...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="border-b border-[#E8ECE9] pb-4">
        <h1 className="text-3xl font-bold text-[#1C222E] font-serif">Memory Timeline</h1>
        <p className="text-sm text-gray-500 font-sans mt-1">
          A chronological overview of your uploaded vault documents, sorted from newest to oldest.
        </p>
      </div>

      <TimelineView documents={documents} />
    </div>
  );
}
