import React from 'react';
import {Text} from 'react-native';
import {useDynamicImport} from 'react-native-dynamic-module-federation';
import {hocPipe, withErrorBoundary, withSuspense} from 'shared';

const Main = () => {
  const Entry = useDynamicImport('entry', './Entry');
  return <Entry />;
};

export default hocPipe([
  withErrorBoundary(<Text>Main 오류</Text>),
  withSuspense(<Text>Main 로딩중</Text>),
])(<Main />);
