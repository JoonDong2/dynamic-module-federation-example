import {QueryClient} from '@tanstack/react-query';
import React from 'react';
import {AppState, Button, Text, View} from 'react-native';
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
import {ScriptManager} from '@callstack/repack/client';

ScriptManager.shared.setMaxListeners(100); // 필요에 따라 알맞게 설정

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
    <>
      <DynamicImport.Provider>
        <Main />
      </DynamicImport.Provider>
      <View
        style={{
          position: 'absolute',
          right: 15,
          bottom: 60,
        }}>
        <Button
          title="앱 업데이트"
          onPress={() => {
            DynamicImport.refresh();
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
