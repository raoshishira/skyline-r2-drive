import React, { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAppStore } from "./store/useAppStore";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import client from "./api/client";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    },
  },
});

function App() {
  const { isAuthenticated, setAuthenticated } = useAppStore();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await client.get("/auth/check");
        if (res.data.authenticated) {
          setAuthenticated(true);
        }
      } catch (err) {
        console.error("Auth check failed", err);
      }
    };
    checkAuth();
  }, [setAuthenticated]);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans">
        {!isAuthenticated ? <LoginPage /> : <DashboardPage />}
      </div>
    </QueryClientProvider>
  );
}

export default App;
