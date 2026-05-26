import React, { useCallback } from "react";
import { Upload, X } from "lucide-react";
import client from "../api/client";
import { useAppStore } from "../store/useAppStore";
import { useTransferStore } from "../store/useTransferStore";
import { useQueryClient } from "@tanstack/react-query";

export const UploadZone = () => {
  const { currentBucket, currentPrefix } = useAppStore();
  const { addTransfer, updateProgress, updateStatus } = useTransferStore();
  const queryClient = useQueryClient();

  const uploadFile = async (file: File, path?: string) => {
    const id = Math.random().toString(36).substring(7);
    const fileName = path || file.name;
    
    addTransfer({
      id,
      name: fileName,
      progress: 0,
      status: "uploading"
    });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("bucket", currentBucket!);
    formData.append("prefix", currentPrefix);
    if (path) {
      formData.append("key", `${currentPrefix}${path}`);
    }

    try {
      await client.post("/r2/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 100));
          updateProgress(id, progress);
        }
      });
      updateStatus(id, "completed");
    } catch (err: any) {
      console.error("Upload failed", err);
      updateStatus(id, "error", err.message);
    }
  };

  const traverseEntry = async (entry: any, path: string = "") => {
    if (entry.isFile) {
      entry.file((file: File) => {
        uploadFile(file, path + entry.name);
      });
    } else if (entry.isDirectory) {
      const reader = entry.createReader();
      const readEntries = () => {
        reader.readEntries(async (entries: any[]) => {
          if (entries.length > 0) {
            for (const childEntry of entries) {
              await traverseEntry(childEntry, path + entry.name + "/");
            }
            readEntries();
          }
        });
      };
      readEntries();
    }
  };

  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const items = e.dataTransfer.items;
    if (!items || !currentBucket) return;

    for (let i = 0; i < items.length; i++) {
      const entry = items[i].webkitGetAsEntry();
      if (entry) {
        await traverseEntry(entry);
      }
    }
    
    // We can't easily await all uploads here because of the recursive nature and callbacks,
    // but invalidating after a short delay or using a counter would work.
    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ["objects", currentBucket, currentPrefix] });
    }, 1000);
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !currentBucket) return;

    for (let i = 0; i < files.length; i++) {
      await uploadFile(files[i]);
    }

    queryClient.invalidateQueries({ queryKey: ["objects", currentBucket, currentPrefix] });
  };

  if (!currentBucket) return null;

  return (
    <div 
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      className="relative group rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-800 p-8 transition-colors hover:border-blue-500/50 hover:bg-blue-50/50 dark:hover:bg-blue-900/10"
    >
      <input
        type="file"
        multiple
        onChange={onFileChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      <div className="flex flex-col items-center justify-center space-y-2 text-center">
        <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-3 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
          <Upload className="h-6 w-6 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
        </div>
        <div>
          <p className="text-sm font-medium">Click or drag to upload</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Files will be uploaded to the current folder</p>
        </div>
      </div>
    </div>
  );
};
