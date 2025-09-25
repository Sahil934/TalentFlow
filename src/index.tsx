import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import App from './App';
import { seedBrowserData } from './utils/seedData'; // new browser-safe seed

const queryClient = new QueryClient();

function Root() {
  useEffect(() => {
    // Seed mock data in the browser once
    seedBrowserData();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

// Start MSW (only in development)
async function prepare() {
  if (process.env.NODE_ENV === 'development') {
    const { worker } = await import('./mocks/browser');
    await worker.start({ serviceWorker: { url: '/mockServiceWorker.js' } }).catch(() => worker.start());
  }
}

prepare().then(() => {
  const container = document.getElementById('root');
  if (!container) throw new Error('Root container not found');
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <Root />
    </React.StrictMode>
  );
});
