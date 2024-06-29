import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {type AlphabetStackParamList} from 'shared/navigation';
import Detail from './screens/Detail';
import Main from './screens/Main';

export const StackNavigator = createStackNavigator<
  AlphabetStackParamList & {
    'alphabet:Main': undefined;
  }
>();

// 개발용
const Stack = () => (
  <StackNavigator.Navigator screenOptions={{headerShown: false}}>
    <StackNavigator.Screen name="alphabet:Main" component={Main} />
    <StackNavigator.Screen name="alphabet:Detail" component={Detail} />
  </StackNavigator.Navigator>
);

export default Stack;
