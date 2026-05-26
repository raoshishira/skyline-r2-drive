import React, { useState } from "react";
import { useTransferStore } from "../store/useTransferStore";
import { ChevronUp, ChevronDown, CheckCircle2, AlertCircle, Loader2, X } from "lucide-react";
import { Button } from "./ui/Button";

export const TransferManager = () => {
  const { transfers, clearCompleted } = useTransferStore();
  const [isExpanded, setIsExpanded] = useState(false);

  if (transfers.length === 0) return null;

  const activeCount = transfers.filter((t) => t.status === "uploading").length;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-950">
      <div 
        className="flex items-center justify-between bg-gray-50 p-4 dark:bg-gray-900 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          {activeCount > 0 ? (
            <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
          ) : (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          )}
          <span className="text-sm font-semibold">
            {activeCount > 0 ? `Uploading ${activeCount} files...` : "Uploads complete"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </div>
      </div>

      {isExpanded && (
        <div className="max-h-96 overflow-y-auto p-4 space-y-4">
          <div className="flex justify-between items-center mb-2">
             <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Recent Transfers</span>
             <Button variant="ghost" size="sm" className="h-6 text-[10px] uppercase" onClick={clearCompleted}>
               Clear Completed
             </Button>
          </div>
          {transfers.map((transfer) => (
            <div key={transfer.id} className="space-y-1.5">
              <div className="flex items-center justify-between gap-4">
                <span className="truncate text-xs font-medium" title={transfer.name}>
                  {transfer.name}
                </span>
                <span className="text-[10px] text-gray-500">{transfer.progress}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                <div 
                  className={`h-full transition-all duration-300 ${
                    transfer.status === "error" ? "bg-red-500" : 
                    transfer.status === "completed" ? "bg-green-500" : "bg-blue-500"
                  }`}
                  style={{ width: `${transfer.progress}%` }}
                />
              </div>
              {transfer.status === "error" && (
                <p className="text-[10px] text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {transfer.error}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
