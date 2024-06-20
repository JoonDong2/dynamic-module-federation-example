import React, {Suspense} from 'react';
import {ErrorBoundary} from 'react-error-boundary';
import {Text} from 'react-native';
import ContainersProvider from './src/ContainersProvider';
import {useImportModule} from 'react-native-dynamic-module-federation';

const A = () => {
  const Entry = useImportModule('entry', './Entry');
  return <Entry content="123" />;
};

const Loading = () => {
  return <Text>Loading</Text>;
};

function App() {
  return (
    <ContainersProvider>
      <ErrorBoundary fallback={<Text>Error</Text>}>
        <Suspense fallback={<Loading />}>
          <A />
        </Suspense>
      </ErrorBoundary>
    </ContainersProvider>
  );
}

export default App;
