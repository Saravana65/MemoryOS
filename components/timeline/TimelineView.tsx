import React from 'react';
import Link from 'next/link';
import { Document } from '@/lib/types/document';
import { TimelineGroup } from './TimelineGroup';

interface TimelineViewProps {
  documents: Document[];
}

export const TimelineView: React.FC<TimelineViewProps> = ({ documents }) => {
  if (!documents || documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-20 bg-white border border-[#E8ECE9] rounded-xl shadow-sm">
        <svg className="h-12 w-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        <h3 className="text-lg font-bold text-[#1C222E] font-serif mb-2">No documents in vault</h3>
        <p className="text-sm text-gray-500 max-w-sm font-sans mb-6">
          Your chronological library is empty. Upload PDFs, images, text files, or docx to begin.
        </p>
        <Link
          href="/upload"
          className="bg-[#4F6D60] hover:bg-[#4F6D60]/90 text-white font-medium py-2.5 px-6 rounded-md text-sm transition-colors font-sans"
        >
          Upload documents
        </Link>
      </div>
    );
  }

  const getDayLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
  };

  const groups: Record<string, Document[]> = {};
  const orderedLabels: string[] = [];

  const sortedDocs = [...documents].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  sortedDocs.forEach((doc) => {
    const label = getDayLabel(doc.created_at);
    if (!groups[label]) {
      groups[label] = [];
      orderedLabels.push(label);
    }
    groups[label].push(doc);
  });

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {orderedLabels.map((label) => (
        <TimelineGroup
          key={label}
          dateLabel={label}
          documents={groups[label]}
        />
      ))}
    </div>
  );
};
export default TimelineView;
