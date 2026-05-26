import { create } from "zustand";

interface Transfer {
  id: string;
  name: string;
  progress: number;
  status: "uploading" | "completed" | "error";
  error?: string;
}

interface TransferState {
  transfers: Transfer[];
  addTransfer: (transfer: Transfer) => void;
  updateProgress: (id: string, progress: number) => void;
  updateStatus: (id: string, status: Transfer["status"], error?: string) => void;
  clearCompleted: () => void;
}

export const useTransferStore = create<TransferState>((set) => ({
  transfers: [],
  addTransfer: (transfer) => set((state) => ({ 
    transfers: [transfer, ...state.transfers].slice(0, 50) // Keep last 50
  })),
  updateProgress: (id, progress) => set((state) => ({
    transfers: state.transfers.map((t) => t.id === id ? { ...t, progress } : t)
  })),
  updateStatus: (id, status, error) => set((state) => ({
    transfers: state.transfers.map((t) => t.id === id ? { ...t, status, error } : t)
  })),
  clearCompleted: () => set((state) => ({
    transfers: state.transfers.filter((t) => t.status === "uploading")
  })),
}));
