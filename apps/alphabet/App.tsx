import React from 'react';
import Stack from './src/Stack';
import {
  hocPipe,
  withErrorBoundary,
  withReactNavigation,
  withSuspense,
} from 'shared';
import {Text} from 'react-native';

const App = () => {
  return <Stack />;
};

export default hocPipe([
  withReactNavigation(),
  withErrorBoundary(<Text>Containers 오류</Text>),
  withSuspense(<Text>Containers 로딩중</Text>),
])(<App />);
