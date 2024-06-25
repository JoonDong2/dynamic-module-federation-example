import React, { Suspense } from 'react';

function withSuspense(fallback: React.ReactNode) {
  return (Component: React.ReactElement) => (
    <Suspense fallback={fallback}>{Component}</Suspense>
  );
}

export default withSuspense;
