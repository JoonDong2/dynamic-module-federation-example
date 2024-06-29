import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import Tab from './Tab';
import {RootStackParamList} from 'shared/navigation';
import {useDynamicLazy} from 'react-native-dynamic-module-federation';

const StackNavigator = createStackNavigator<
  RootStackParamList & {
    Tab: undefined;
  }
>();

const Stack = () => {
  const AlphabetDetail = useDynamicLazy(
    'alphabet',
    './alphabet/screens/Detail',
  );
  return (
    <StackNavigator.Navigator screenOptions={{headerShown: false}}>
      <StackNavigator.Screen name="Tab" component={Tab} />
      <StackNavigator.Screen
        name="alphabet:Detail"
        component={AlphabetDetail}
      />
    </StackNavigator.Navigator>
  );
};

export default Stack;
