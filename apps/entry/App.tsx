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
import {QueryClient} from '@tanstack/react-query';
import {AppState, Text} from 'react-native';
import {ScriptManager} from '@callstack/repack/client';
import {
  DynamicImportManager,
  DynamicImportProvider,
} from 'react-native-dynamic-module-federation';

ScriptManager.shared.setMaxListeners(100); // 필요에 따라 알맞게 설정

const manager = new DynamicImportManager({
  fetchContainers,
});

let appState = AppState.currentState;

// inactive 무시
AppState.addEventListener('change', nextAppState => {
  if (appState === 'background' && nextAppState === 'active') {
    manager.refreshContainers();
  }

  appState = nextAppState;
});

const App = () => {
  return (
    <DynamicImportProvider manager={manager} suspense throwError>
      <Entry />
    </DynamicImportProvider>
  );
};

const queryClient = new QueryClient();

export default hocPipe([
  withReactNavigation(),
  withReactQuery(queryClient),
  withErrorBoundary(<Text>Containers 오류</Text>),
  withSuspense(<Text>Containers 로딩중</Text>),
])(<App />);
