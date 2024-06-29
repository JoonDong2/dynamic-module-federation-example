import React from 'react';
import Entry from './src/Entry';
import {
  hocPipe,
  withErrorBoundary,
  withReactQuery,
  withReactNavigation,
  withSuspense,
  fetchContainers,
} from 'shared';
import {createDynamicImport} from 'react-native-dynamic-module-federation';
import {QueryClient} from '@tanstack/react-query';
import {AppState, Text} from 'react-native';

const DynamicImport = createDynamicImport({
  fetchContainers,
  deleteCacheFilesWhenRefresh: false,
});

let appState = AppState.currentState;

// inactive 무시
AppState.addEventListener('change', nextAppState => {
  if (appState === 'background' && nextAppState === 'active') {
    DynamicImport.refresh();
  }

  appState = nextAppState;
});

const App = () => {
  return (
    <DynamicImport.Provider>
      <Entry />
    </DynamicImport.Provider>
  );
};

const queryClient = new QueryClient();

export default hocPipe([
  withReactNavigation(),
  withReactQuery(queryClient),
  withErrorBoundary(<Text>Containers 오류</Text>),
  withSuspense(<Text>Containers 로딩중</Text>),
])(<App />);
