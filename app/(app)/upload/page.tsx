'use client';

import React, { useState, useEffect, useCallback } from 'react';
import DropZone from '@/components/upload/DropZone';
import UploadQueue, { UploadQueueItem } from '@/components/upload/UploadQueue';
import FileList from '@/components/upload/FileList';
import { Document } from '@/lib/types/document';
import { getFiles, deleteFile, uploadFile } from '@/lib/api/files';

export default function UploadPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadQueue, setUploadQueue] = useState<UploadQueueItem[]>([]);

  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getFiles();
      setDocuments(data.items);
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleFilesSelected = (files: File[]) => {
    files.forEach((file) => {
      const queueId = Math.random().toString(36).substring(2, 11);
      
      const newQueueItem: UploadQueueItem = {
        id: queueId,
        file,
        progress: 0,
        status: 'uploading',
      };

      setUploadQueue((prev) => [newQueueItem, ...prev]);

      uploadFile(file, (progress) => {
        setUploadQueue((prev) =>
          prev.map((item) => (item.id === queueId ? { ...item, progress } : item))
        );
      })
        .then((uploadedDoc) => {
          // Update status in the upload queue to "pending"
          setUploadQueue((prev) =>
            prev.map((item) =>
              item.id === queueId ? { ...item, status: 'pending', progress: 100 } : item
            )
          );
          
          // Add the new document directly to the documents list
          setDocuments((prev) => [uploadedDoc, ...prev]);

          // Clear item from queue after a short delay
          setTimeout(() => {
            setUploadQueue((prev) => prev.filter((item) => item.id !== queueId));
          }, 3000);
        })
        .catch((err: Error) => {
          setUploadQueue((prev) =>
            prev.map((item) =>
              item.id === queueId ? { ...item, status: 'failed', error: err.message } : item
            )
          );
        });
    });
  };

  const handleDeleteDocument = async (id: string) => {
    await deleteFile(id);
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Upload Documents</h1>
        <p className="text-gray-500">Add materials to your personal knowledge base.</p>
      </div>

      <DropZone onFilesSelected={handleFilesSelected} />

      <UploadQueue items={uploadQueue} />

      <FileList
        documents={documents}
        isLoading={isLoading}
        onDelete={handleDeleteDocument}
        onRefresh={fetchDocuments}
      />
    </div>
  );
}
