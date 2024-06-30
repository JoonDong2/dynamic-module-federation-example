import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {RootStackParamList} from 'shared/navigation';
import Detail from './screens/Detail';
import Main from './screens/Main';
import {useDynamicLazy} from 'react-native-dynamic-module-federation';
import {Text} from 'react-native';

export const StackNavigator = createStackNavigator<
  RootStackParamList & {
    'number:Main': undefined;
  }
>();

// 개발용
const Stack = () => {
  const AlphabetDetail = useDynamicLazy(
    'alphabet',
    './alphabet/screens/Detail',
    {
      fallbacks: {
        suspense: <Text>AlphabetDetail 로딩중</Text>,
        error: <Text>AlphabetDetail 오류</Text>,
      },
    },
  );
  return (
    <StackNavigator.Navigator screenOptions={{headerShown: false}}>
      <StackNavigator.Screen name="number:Main" component={Main} />
      <StackNavigator.Screen name="number:Detail" component={Detail} />
      <StackNavigator.Screen
        name="alphabet:Detail"
        component={AlphabetDetail}
      />
    </StackNavigator.Navigator>
  );
};

export default Stack;
