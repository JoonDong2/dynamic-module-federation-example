import React from 'react';
import {Text} from 'react-native';
import {useDynamicLazy} from 'react-native-dynamic-module-federation';

const Main = () => {
  const Entry = useDynamicLazy('entry', './Entry', {
    error: {
      fallback: <Text>Main 오류</Text>,
    },
    suspenes: {
      fallback: <Text>Main 로딩중</Text>,
    },
  });
  return <Entry />;
};

export default Main;
