import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppRoutes from './routes/AppRoutes';
import { useThemeStore } from './store/themeStore';

// Initialise TanStack Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Prevent aggressive focus refetching
      retry: false, // Simplify error states
      staleTime: 1000 * 60 * 5, // 5 minutes cache default
    },
  },
});

function App() {
  const initTheme = useThemeStore((state) => state.initTheme);

  // Setup theme styling hooks
  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
