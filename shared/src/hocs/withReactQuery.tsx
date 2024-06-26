import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

function withReactQuery(queryClient: QueryClient) {
  return (Component: React.ReactElement) => (
    <QueryClientProvider client={queryClient}>{Component}</QueryClientProvider>
  );
}

export default withReactQuery;
