import React from 'react';
import { Document } from '@/lib/types/document';
import { TimelineEntry } from './TimelineEntry';

interface TimelineGroupProps {
  dateLabel: string;
  documents: Document[];
}

export const TimelineGroup: React.FC<TimelineGroupProps> = ({ dateLabel, documents }) => {
  return (
    <div className="space-y-4">
      {/* Date Header */}
      <div className="flex items-center gap-4">
        <h3 className="text-xs font-bold text-[#4F6D60] font-sans tracking-wider uppercase">
          {dateLabel}
        </h3>
        <div className="flex-1 h-px bg-[#E8ECE9]"></div>
      </div>

      {/* Items list with timeline line decoration */}
      <div className="relative pl-6 border-l-2 border-[#E8ECE9] ml-3.5 space-y-4">
        {documents.map((doc) => (
          <div key={doc.id} className="relative">
            {/* Timeline node circle indicator */}
            <div className="absolute -left-[31px] top-6 w-2 h-2 rounded-full bg-[#4F6D60] border border-white ring-4 ring-[#FAF9F6]"></div>
            <TimelineEntry doc={doc} />
          </div>
        ))}
      </div>
    </div>
  );
};
export default TimelineGroup;
