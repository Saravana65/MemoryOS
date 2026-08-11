import React from 'react';
import Link from 'next/link';
import { SearchResultItem } from '@/lib/types/search';

interface SearchResultCardProps {
  result: SearchResultItem;
}

export const SearchResultCard: React.FC<SearchResultCardProps> = ({ result }) => {
  const getRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return diffMins <= 1 ? 'Just now' : `${diffMins} minutes ago`;
    } else if (diffHours < 24) {
      return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
    } else if (diffDays < 30) {
      return diffDays === 1 ? 'Yesterday' : `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf':
        return (
          <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 00-2 2z" />
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

  const truncateText = (text: string, limit = 200) => {
    if (text.length <= limit) return text;
    return text.substring(0, limit) + '...';
  };

  // Sort matches descending by relevance score
  const sortedMatches = [...result.matches].sort((a, b) => b.score - a.score);
  const visibleMatches = sortedMatches.slice(0, 2);
  const remainingCount = result.matches.length - visibleMatches.length;

  return (
    <Link href="/chat" className="block focus:outline-none">
      <div className="flex flex-col p-4 bg-white border border-[#E8ECE9] rounded-lg shadow-sm hover:border-[#4F6D60] transition-colors cursor-pointer space-y-3">
        {/* Card Header */}
        <div className="flex items-center justify-between min-w-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="bg-[#FAF9F6] p-1.5 rounded border border-[#E8ECE9] flex-shrink-0">
              {getFileIcon(result.file_type)}
            </div>
            <p className="text-sm font-semibold text-[#1C222E] truncate font-sans">{result.filename}</p>
          </div>
          <span className="text-[10px] text-gray-400 font-sans flex-shrink-0">
            {getRelativeTime(result.created_at)}
          </span>
        </div>

        {/* Snippets list */}
        <div className="space-y-3 pl-3.5 border-l border-[#E8ECE9]">
          {visibleMatches.map((match, idx) => (
            <div key={idx} className="text-xs">
              <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                {match.page_number !== null && match.page_number !== undefined && (
                  <span className="font-sans text-[10px] font-semibold bg-[#E8ECE9]/60 text-gray-600 px-1.5 py-0.5 rounded">
                    Page {match.page_number}
                  </span>
                )}
                <span className="text-[9px] font-sans font-medium text-gray-400">
                  Relevance: {Math.round(match.score * 100)}%
                </span>
              </div>
              <blockquote className="text-gray-600 font-serif italic leading-relaxed bg-[#FAF9F6]/50 p-2 border border-[#FAF9F6] rounded">
                "{truncateText(match.chunk_text)}"
              </blockquote>
            </div>
          ))}
        </div>

        {/* Remaining Count Indicator */}
        {remainingCount > 0 && (
          <div className="text-[10px] text-[#4F6D60] font-sans font-semibold pl-3.5">
            +{remainingCount} more matches in this document
          </div>
        )}
      </div>
    </Link>
  );
};
export default SearchResultCard;
