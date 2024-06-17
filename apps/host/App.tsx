import {Federated} from '@callstack/repack/client';
import React, {Suspense} from 'react';
import {Text} from 'react-native';

const MainEntry = React.lazy(() => Federated.importModule('entry', './Entry'));

function App() {
  return (
    <Suspense fallback={<Text>Loading</Text>}>
      <MainEntry />
    </Suspense>
  );
}

export default App;
