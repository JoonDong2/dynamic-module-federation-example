import React from 'react';
import Entry from './src/Entry';
import {
  hocPipe,
  useContainers,
  withErrorBoundary,
  withQueryClient,
  withSuspense,
} from 'shared';
import {ImportModuleProvider} from 'react-native-dynamic-module-federation';
import {QueryClient} from '@tanstack/react-query';
import {Text} from 'react-native';

const App = () => {
  const containers = useContainers({suspense: false});

  return (
    <ImportModuleProvider containers={containers}>
      <Entry />
    </ImportModuleProvider>
  );
};

const queryClient = new QueryClient();

export default hocPipe([
  withQueryClient(queryClient),
  withErrorBoundary(<Text>Containers 오류</Text>),
  withSuspense(<Text>Containers 로딩중</Text>),
])(<App />);
