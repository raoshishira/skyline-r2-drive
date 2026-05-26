import React from "react";
import { BucketSidebar } from "../components/BucketSidebar";
import { FileBrowser } from "../components/FileBrowser";
import { UploadZone } from "../components/UploadZone";
import { useAppStore } from "../store/useAppStore";
import { Button } from "../components/ui/Button";
import client from "../api/client";

export const DashboardPage = () => {
  const setAuthenticated = useAppStore((state) => state.setAuthenticated);

  const handleLogout = async () => {
    try {
      await client.post("/auth/logout");
      setAuthenticated(false);
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <BucketSidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <header className="flex h-16 items-center justify-between border-b px-6 dark:border-gray-800">
          <h1 className="text-xl font-bold">Skyline R2 Drive</h1>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </header>
        <main className="flex-1 overflow-y-auto p-6 space-y-8">
          <UploadZone />
          <FileBrowser />
        </main>
      </div>
    </div>
  );
};
