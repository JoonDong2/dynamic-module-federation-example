'use strict';

import {Federated} from '@callstack/repack/client';
import React, {Suspense} from 'react';
import {ErrorBoundary} from 'react-error-boundary';
import {Text} from 'react-native';

const MainEntry = React.lazy(() => Federated.importModule('entry', './Entry'));

function App() {
  return (
    <ErrorBoundary fallback={<Text>Error</Text>}>
      <Suspense fallback={<Text>Loading</Text>}>
        <MainEntry />
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
