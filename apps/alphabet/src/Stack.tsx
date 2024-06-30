import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {type RootStackParamList} from 'shared/navigation';
import Detail from './screens/Detail';
import Main from './screens/Main';
import {useDynamicLazy} from 'react-native-dynamic-module-federation';
import {Text} from 'react-native';

export const StackNavigator = createStackNavigator<
  RootStackParamList & {
    'alphabet:Main': undefined;
  }
>();

// 개발용
const Stack = () => {
  const NumberDetail = useDynamicLazy('number', './number/screens/Detail', {
    fallbacks: {
      suspense: <Text>NumberDetail 로딩중</Text>,
      error: <Text>NumberDetail 오류</Text>,
    },
  });
  return (
    <StackNavigator.Navigator screenOptions={{headerShown: false}}>
      <StackNavigator.Screen name="alphabet:Main" component={Main} />
      <StackNavigator.Screen name="alphabet:Detail" component={Detail} />
      <StackNavigator.Screen name="number:Detail" component={NumberDetail} />
    </StackNavigator.Navigator>
  );
};

export default Stack;
