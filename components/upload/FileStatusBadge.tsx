import React from 'react';

interface FileStatusBadgeProps {
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'uploading';
}

export const FileStatusBadge: React.FC<FileStatusBadgeProps> = ({ status }) => {
  const styles = {
    uploading: 'bg-blue-50 text-blue-700 border-blue-200',
    pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    processing: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    completed: 'bg-green-50 text-green-700 border-green-200',
    failed: 'bg-red-50 text-red-700 border-red-200',
  };

  const labels = {
    uploading: 'Uploading',
    pending: 'Pending',
    processing: 'Processing',
    completed: 'Ready',
    failed: 'Failed',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}>
      {(status === 'uploading' || status === 'processing') && (
        <svg className="animate-spin -ml-1 mr-1.5 h-3 w-3 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {labels[status]}
    </span>
  );
};
export default FileStatusBadge;
