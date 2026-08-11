import React, { useState } from 'react';
import { ChatSource } from '@/lib/types/chat';

interface SourceCitationProps {
  sources: ChatSource[];
}

export const SourceCitation: React.FC<SourceCitationProps> = ({ sources }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!sources || sources.length === 0) return null;

  return (
    <div className="mt-3 border-t border-[#E8ECE9] pt-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-xs font-semibold text-[#4F6D60] hover:text-[#1C222E] transition-colors focus:outline-none"
      >
        <svg
          className={`h-3.5 w-3.5 transform transition-transform ${isOpen ? 'rotate-90' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span>
          Sources ({sources.length})
        </span>
      </button>

      {isOpen && (
        <div className="mt-2 space-y-3 pl-5 border-l border-[#E8ECE9]">
          {sources.map((source, index) => (
            <div key={index} className="text-xs">
              <div className="flex items-center gap-1.5 font-sans font-medium text-[#1C222E] mb-1">
                <svg className="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="font-semibold">{source.filename}</span>
                {source.page_number !== null && source.page_number !== undefined && (
                  <span className="text-gray-400 text-[10px]">Page {source.page_number}</span>
                )}
              </div>
              <blockquote className="border-l border-[#4F6D60] pl-3 py-1 bg-[#FAF9F6]/50 text-gray-600 italic font-serif leading-relaxed rounded-r">
                "{source.snippet}"
              </blockquote>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default SourceCitation;
