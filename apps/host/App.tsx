import {QueryClient} from '@tanstack/react-query';
import React from 'react';
import {Text} from 'react-native';
import {ImportModuleProvider} from 'react-native-dynamic-module-federation';
import {
  useContainers,
  hocPipe,
  withQueryClient,
  withErrorBoundary,
  withSuspense,
} from 'shared';
import Main from './src/Main';

const App = () => {
  const containers = useContainers({suspense: false});

  if (!containers) {
    return null;
  }

  return (
    <ImportModuleProvider containers={containers}>
      <Main />
    </ImportModuleProvider>
  );
};

const queryClient = new QueryClient();

export default hocPipe([
  withQueryClient(queryClient),
  withErrorBoundary(<Text>Containers 오류</Text>),
  withSuspense(<Text>Containers 로딩중</Text>),
])(<App />);
