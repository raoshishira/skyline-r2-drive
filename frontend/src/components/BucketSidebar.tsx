import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import client from "../api/client";
import { useAppStore } from "../store/useAppStore";
import { Database, Loader2, Settings } from "lucide-react";
import { SettingsModal } from "./SettingsModal";

export const BucketSidebar = () => {
  const { currentBucket, setCurrentBucket } = useAppStore();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const { data: buckets, isLoading, error } = useQuery({
    queryKey: ["buckets"],
    queryFn: async () => {
      const res = await client.get("/r2/buckets");
      return res.data;
    },
    retry: false,
  });

  return (
    <aside className="w-64 flex-shrink-0 border-r dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex flex-col h-full">
      <div className="p-6 flex-1 overflow-y-auto">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">
          R2 Buckets
        </h2>
        {isLoading ? (
          <div className="flex justify-center p-4">
            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
          </div>
        ) : error ? (
          <div className="p-4 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-md">
            Failed to load buckets. Check your R2 configuration.
          </div>
        ) : (
          <nav className="space-y-1">
            {buckets?.map((bucket: any) => (
              <button
                key={bucket.Name}
                onClick={() => setCurrentBucket(bucket.Name)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  currentBucket === bucket.Name
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400"
                    : "text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
              >
                <Database className="h-4 w-4" />
                <span className="truncate">{bucket.Name}</span>
              </button>
            ))}
          </nav>
        )}
      </div>

      <div className="p-4 border-top dark:border-gray-800">
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-800 rounded-md transition-colors"
        >
          <Settings className="h-4 w-4" />
          Settings
        </button>
      </div>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </aside>
  );
};
