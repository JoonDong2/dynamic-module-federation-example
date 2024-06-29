import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {TabParamList} from 'shared/navigation';
import {useDynamicLazy} from 'react-native-dynamic-module-federation';

const TabNavigator = createBottomTabNavigator<TabParamList>();

const Tab = () => {
  const AlphabetMain = useDynamicLazy('alphabet', './alphabet/screens/Main');
  return (
    <TabNavigator.Navigator screenOptions={{headerShown: false}}>
      <TabNavigator.Screen name="alphabet:Main" component={AlphabetMain} />
    </TabNavigator.Navigator>
  );
};

export default Tab;
