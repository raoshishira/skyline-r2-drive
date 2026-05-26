import React, { useCallback } from "react";
import { Upload, X } from "lucide-react";
import client from "../api/client";
import { useAppStore } from "../store/useAppStore";
import { useQueryClient } from "@tanstack/react-query";

export const UploadZone = () => {
  const { currentBucket, currentPrefix } = useAppStore();
  const queryClient = useQueryClient();

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !currentBucket) return;

    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      formData.append("file", files[i]);
      formData.append("bucket", currentBucket);
      formData.append("prefix", currentPrefix);

      try {
        await client.post("/r2/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } catch (err) {
        console.error("Upload failed", err);
      }
    }

    queryClient.invalidateQueries({ queryKey: ["objects", currentBucket, currentPrefix] });
  };

  if (!currentBucket) return null;

  return (
    <div className="relative group rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-800 p-8 transition-colors hover:border-blue-500/50 hover:bg-blue-50/50 dark:hover:bg-blue-900/10">
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
