'use client';

import React, { useState } from 'react';
import { Document } from '@/lib/types/document';
import FileStatusBadge from './FileStatusBadge';

interface FileListProps {
  documents: Document[];
  isLoading: boolean;
  onDelete: (id: string) => Promise<void>;
  onRefresh: () => void;
}

const formatBytes = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (e) {
    return dateString;
  }
};

export const FileList: React.FC<FileListProps> = ({
  documents,
  isLoading,
  onDelete,
  onRefresh,
}) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDeleteClick = (id: string) => {
    setConfirmDeleteId(id);
    setError(null);
  };

  const handleConfirmDelete = async (id: string) => {
    setConfirmDeleteId(null);
    setDeletingId(id);
    setError(null);
    try {
      await onDelete(id);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to delete file.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleCancelDelete = () => {
    setConfirmDeleteId(null);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 rounded-t-lg flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Your Documents</h3>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="text-xs bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 px-3 py-1.5 rounded-md font-medium transition-colors inline-flex items-center gap-1.5 disabled:opacity-50"
        >
          <svg
            className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H17"
            />
          </svg>
          Refresh
        </button>
      </div>

      {error && (
        <div className="m-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-xs">
          {error}
        </div>
      )}

      {documents.length === 0 ? (
        <div className="p-12 text-center text-gray-500">
          {isLoading ? (
            <div className="flex flex-col items-center space-y-2">
              <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Loading documents...</span>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="font-semibold text-gray-900">No documents found</p>
              <p className="text-sm">Upload your first document above to get started.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
            <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">Filename</th>
                <th className="px-6 py-3">Size</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Uploaded</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900 max-w-xs truncate" title={doc.filename}>
                    {doc.filename}
                  </td>
                  <td className="px-6 py-4 text-gray-500">{formatBytes(doc.file_size_bytes)}</td>
                  <td className="px-6 py-4">
                    <FileStatusBadge status={doc.status} />
                  </td>
                  <td className="px-6 py-4 text-gray-500">{formatDate(doc.created_at)}</td>
                  <td className="px-6 py-4 text-right">
                    {confirmDeleteId === doc.id ? (
                      <div className="flex items-center justify-end space-x-2 text-xs">
                        <span className="text-gray-550 font-semibold">Delete?</span>
                        <button
                          onClick={() => handleConfirmDelete(doc.id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded font-medium transition-colors"
                        >
                          Yes
                        </button>
                        <button
                          onClick={handleCancelDelete}
                          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-2 py-1 rounded font-medium transition-colors"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleDeleteClick(doc.id)}
                        disabled={deletingId === doc.id}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50 font-medium transition-colors inline-flex items-center gap-1 text-xs"
                      >
                        {deletingId === doc.id ? (
                          <>
                            <svg className="animate-spin h-3 w-3 text-red-600" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Deleting...
                          </>
                        ) : (
                          'Delete'
                        )}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
export default FileList;
