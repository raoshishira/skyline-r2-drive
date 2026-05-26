import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import client from "../api/client";
import { useAppStore } from "../store/useAppStore";
import { Folder, File, ChevronRight, ArrowLeft, Loader2, Download, Trash2, Database, Share2 } from "lucide-react";
import { Button } from "./ui/Button";

export const FileBrowser = () => {
  const { currentBucket, currentPrefix, navigateUp, navigateInto } = useAppStore();
  const queryClient = useQueryClient();

  const handleShare = async (key: string) => {
    try {
      const res = await client.get(`/r2/signed-url?bucket=${currentBucket}&key=${encodeURIComponent(key)}`);
      await navigator.clipboard.writeText(res.data.url);
      alert("Signed URL copied to clipboard! (Expires in 1 hour)");
    } catch (err) {
      console.error("Failed to generate signed URL", err);
      alert("Failed to generate share link");
    }
  };

  const { data: items, isLoading } = useQuery({
    queryKey: ["objects", currentBucket, currentPrefix],
    queryFn: async () => {
      if (!currentBucket) return [];
      const res = await client.get(`/r2/objects?bucket=${currentBucket}&prefix=${currentPrefix}`);
      return res.data;
    },
    enabled: !!currentBucket,
  });

  const deleteMutation = useMutation({
    mutationFn: async (key: string) => {
      await client.delete(`/r2/object?bucket=${currentBucket}&key=${key}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["objects", currentBucket, currentPrefix] });
    },
  });

  const downloadFile = (key: string) => {
    window.open(`http://localhost:3001/api/r2/download?bucket=${currentBucket}&key=${encodeURIComponent(key)}`, "_blank");
  };

  const downloadFolder = (prefix: string) => {
    window.open(`http://localhost:3001/api/r2/download/folder?bucket=${currentBucket}&prefix=${encodeURIComponent(prefix)}`, "_blank");
  };

  const isImage = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    return ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext || "");
  };

  if (!currentBucket) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <Database className="h-12 w-12 mb-4 opacity-20" />
        <p>Select a bucket to start browsing</p>
      </div>
    );
  }

  const breadcrumbs = currentPrefix.split("/").filter(Boolean);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Button variant="ghost" size="sm" onClick={() => navigateUp()} disabled={!currentPrefix}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <span className="font-medium text-gray-900 dark:text-gray-100">{currentBucket}</span>
          {breadcrumbs.map((part, i) => (
            <React.Fragment key={i}>
              <ChevronRight className="h-3 w-3" />
              <span>{part}</span>
            </React.Fragment>
          ))}
        </div>
        <div className="flex gap-2">
           <Button size="sm" onClick={() => downloadFolder(currentPrefix)} disabled={!currentPrefix}>
             Download Folder (.zip)
           </Button>
        </div>
      </div>

      <div className="rounded-lg border dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-800">
            <tr>
              <th className="px-6 py-3 font-medium">Name</th>
              <th className="px-6 py-3 font-medium">Size</th>
              <th className="px-6 py-3 font-medium">Last Modified</th>
              <th className="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-gray-800">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" />
                </td>
              </tr>
            ) : items?.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                  This folder is empty
                </td>
              </tr>
            ) : (
              items?.map((item: any) => (
                <tr key={item.key} className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {item.type === "folder" ? (
                        <button 
                          onClick={() => navigateInto(item.key.substring(currentPrefix.length))}
                          className="flex items-center gap-3 text-blue-600 hover:underline dark:text-blue-400"
                        >
                          <Folder className="h-4 w-4 fill-blue-600/20" />
                          <span className="font-medium">{item.key.replace(currentPrefix, "")}</span>
                        </button>
                      ) : (
                        <>
                          {isImage(item.key) ? (
                            <div className="h-8 w-8 rounded bg-gray-100 dark:bg-gray-800 overflow-hidden flex-shrink-0 border dark:border-gray-700">
                              <img 
                                src={`http://localhost:3001/api/r2/thumbnail?bucket=${currentBucket}&key=${encodeURIComponent(item.key)}`} 
                                alt=""
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  (e.target as any).src = ""; // Clear src to trigger fallback or just hide
                                  (e.target as any).style.display = "none";
                                }}
                              />
                            </div>
                          ) : (
                            <File className="h-4 w-4 text-gray-400" />
                          )}
                          <span>{item.key.replace(currentPrefix, "")}</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                    {item.size ? (item.size / 1024).toFixed(1) + " KB" : "-"}
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                    {item.lastModified ? new Date(item.lastModified).toLocaleDateString() : "-"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.type === "file" && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600" onClick={() => handleShare(item.key)}>
                          <Share2 className="h-4 w-4" />
                        </Button>
                      )}
                      {item.type === "file" ? (
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => downloadFile(item.key)}>
                          <Download className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => downloadFolder(item.key)}>
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-red-600 hover:text-red-700"
                        onClick={() => deleteMutation.mutate(item.key)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
