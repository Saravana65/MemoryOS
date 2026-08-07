'use client';

import React from 'react';
import FileStatusBadge from './FileStatusBadge';

export interface UploadQueueItem {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'pending' | 'failed';
  error?: string;
}

interface UploadQueueProps {
  items: UploadQueueItem[];
}

const formatBytes = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const UploadQueue: React.FC<UploadQueueProps> = ({ items }) => {
  if (items.length === 0) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 rounded-t-lg">
        <h3 className="text-sm font-semibold text-gray-900">Upload Queue ({items.length} files)</h3>
      </div>
      <ul className="divide-y divide-gray-200 max-h-[18rem] overflow-y-auto">
        {items.map((item) => (
          <li key={item.id} className="p-4 space-y-2">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate" title={item.file.name}>
                  {item.file.name}
                </p>
                <p className="text-xs text-gray-500">{formatBytes(item.file.size)}</p>
              </div>
              <div className="flex-shrink-0">
                <FileStatusBadge status={item.status} />
              </div>
            </div>

            {item.status === 'uploading' && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Uploading...</span>
                  <span className="font-medium">{item.progress}%</span>
                </div>
                <div className="w-full bg-gray-250 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              </div>
            )}

            {item.status === 'failed' && item.error && (
              <p className="text-xs text-red-600 mt-1 leading-relaxed bg-red-50 p-2 rounded border border-red-100">
                Error: {item.error}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};
export default UploadQueue;
