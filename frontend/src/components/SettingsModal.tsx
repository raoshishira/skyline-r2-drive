import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import client from "../api/client";
import { Button } from "./ui/Button";
import { X, Settings, Loader2 } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    endpoint: "",
    accessKeyId: "",
    secretAccessKey: "",
    bucket: "",
  });

  const { data: config, isLoading } = useQuery({
    queryKey: ["config"],
    queryFn: async () => {
      const res = await client.get("/r2/config");
      return res.data;
    },
    enabled: isOpen,
  });

  useEffect(() => {
    if (config) {
      setFormData(config);
    }
  }, [config]);

  const mutation = useMutation({
    mutationFn: async (newConfig: typeof formData) => {
      await client.post("/r2/config", newConfig);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buckets"] });
      queryClient.invalidateQueries({ queryKey: ["config"] });
      onClose();
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-900">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-gray-500" />
            <h2 className="text-xl font-bold">R2 Configuration</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <X className="h-5 w-5" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              mutation.mutate(formData);
            }}
            className="space-y-4"
          >
            <div className="space-y-1">
              <label className="text-sm font-medium">S3 Endpoint</label>
              <input
                type="text"
                className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-800 dark:bg-gray-950"
                placeholder="https://<id>.r2.cloudflarestorage.com"
                value={formData.endpoint}
                onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Access Key ID</label>
              <input
                type="text"
                className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-800 dark:bg-gray-950"
                value={formData.accessKeyId}
                onChange={(e) => setFormData({ ...formData, accessKeyId: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Secret Access Key</label>
              <input
                type="password"
                className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-800 dark:bg-gray-950"
                placeholder={formData.secretAccessKey === "****" ? "••••••••" : "Enter secret key"}
                value={formData.secretAccessKey === "****" ? "" : formData.secretAccessKey}
                onChange={(e) => setFormData({ ...formData, secretAccessKey: e.target.value })}
                required={formData.secretAccessKey !== "****"}
              />
              {formData.secretAccessKey === "****" && (
                <p className="text-xs text-gray-500 mt-1">Leave blank to keep current secret</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Default Bucket (Optional)</label>
              <input
                type="text"
                className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-800 dark:bg-gray-950"
                value={formData.bucket}
                onChange={(e) => setFormData({ ...formData, bucket: e.target.value })}
              />
            </div>

            <div className="pt-4 flex gap-3">
              <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={mutation.isPending}>
                {mutation.isPending ? "Saving..." : "Save Config"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
