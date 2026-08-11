import React from 'react';
import Link from 'next/link';
import { Document } from '@/lib/types/document';
import { FileStatusBadge } from '@/components/upload/FileStatusBadge';

interface TimelineEntryProps {
  doc: Document;
}

export const TimelineEntry: React.FC<TimelineEntryProps> = ({ doc }) => {
  const isReady = doc.status === 'ready';
  const isPendingOrProcessing = doc.status === 'pending' || doc.status === 'processing';
  const isFailed = doc.status === 'failed';

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf':
        return (
          <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        );
      case 'image':
        return (
          <svg className="h-5 w-5 text-[#4F6D60]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'txt':
        return (
          <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'docx':
        return (
          <svg className="h-5 w-5 text-[#C5A059]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
      default:
        return (
          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        );
    }
  };

  const uploadTime = new Date(doc.created_at).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const entryContent = (
    <div
      className={`flex flex-col p-4 bg-white border border-[#E8ECE9] rounded-lg shadow-sm hover:border-[#4F6D60] transition-all cursor-pointer ${
        isPendingOrProcessing ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-center justify-between min-w-0">
        <div className="flex items-center gap-4 min-w-0">
          <div className="flex-shrink-0 bg-[#FAF9F6] p-2 rounded-md border border-[#E8ECE9]">
            {getFileIcon(doc.file_type)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#1C222E] truncate font-sans">{doc.filename}</p>
            <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-500 font-sans">
              <span>{formatBytes(doc.file_size_bytes)}</span>
              <span>•</span>
              <span>Uploaded at {uploadTime}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <FileStatusBadge status={doc.status} />
        </div>
      </div>

      {isFailed && doc.processing_error && (
        <div className="mt-2 text-xs text-red-600 font-sans bg-red-50/50 border border-red-100 rounded px-2.5 py-1.5 leading-relaxed">
          <span className="font-semibold">Pipeline Error:</span> {doc.processing_error}
        </div>
      )}
    </div>
  );

  return (
    <div className="relative">
      {isReady ? (
        <Link href="/chat" className="block focus:outline-none">
          {entryContent}
        </Link>
      ) : (
        <div>{entryContent}</div>
      )}
    </div>
  );
};
export default TimelineEntry;
