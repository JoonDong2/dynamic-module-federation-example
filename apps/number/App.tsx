import React from 'react';
import Stack from './src/Stack';
import {
  fetchContainers,
  hocPipe,
  withErrorBoundary,
  withReactNavigation,
  withSuspense,
} from 'shared';
import {AppState, Text} from 'react-native';
import {createDynamicImport} from 'react-native-dynamic-module-federation';

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
      <Stack />
    </DynamicImport.Provider>
  );
};

export default hocPipe([
  withReactNavigation(),
  withErrorBoundary(<Text>Containers 오류</Text>),
  withSuspense(<Text>Containers 로딩중</Text>),
])(<App />);
