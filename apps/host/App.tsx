import {QueryClient} from '@tanstack/react-query';
import React from 'react';
import {AppState, Text} from 'react-native';
import {createDynamicImport} from 'react-native-dynamic-module-federation';
import {
  hocPipe,
  withReactQuery,
  withErrorBoundary,
  withSuspense,
  withReactNavigation,
  fetchContainers,
} from 'shared';
import Main from './src/Main';

const DynamicImport = createDynamicImport({
  fetchContainers,
  deleteCacheFilesWhenRefresh: false,
  suspense: true,
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
      <Main />
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
