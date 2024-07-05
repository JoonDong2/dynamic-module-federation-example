import {QueryClient} from '@tanstack/react-query';
import React from 'react';
import {AppState, Button, Text, View} from 'react-native';
import {
  DynamicImportManager,
  DynamicImportProvider,
} from 'react-native-dynamic-module-federation';
import {
  hocPipe,
  withReactQuery,
  withErrorBoundary,
  withSuspense,
  withReactNavigation,
  fetchContainers,
} from 'shared';
import Main from './src/Main';
import {ScriptManager} from '@callstack/repack/client';

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
    <>
      <DynamicImportProvider manager={manager} suspense throwError>
        <Main />
      </DynamicImportProvider>
      <View
        style={{
          position: 'absolute',
          right: 15,
          bottom: 60,
        }}>
        <Button
          title="앱 업데이트"
          onPress={() => {
            manager.refreshContainers();
          }}
        />
      </View>
    </>
  );
};

const queryClient = new QueryClient();

export default hocPipe([
  withReactNavigation(),
  withReactQuery(queryClient),
  withErrorBoundary(<Text>Containers 오류</Text>),
  withSuspense(<Text>Containers 로딩중</Text>),
])(<App />);
