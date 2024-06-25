import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';

function withErrorBoundary(fallback: React.ReactElement) {
  return (Component: React.ReactElement) => (
    <ErrorBoundary fallback={fallback}>{Component}</ErrorBoundary>
  );
}

export default withErrorBoundary;
