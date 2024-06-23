import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import ScreenA from './screens/ScreenA';
import ScreenB from './screens/ScreenB';
import {TabParamList} from './screens/types';

const TabNavigator = createBottomTabNavigator<TabParamList>();

const Tab = () => {
  return (
    <TabNavigator.Navigator>
      <TabNavigator.Screen name="ScreenA" component={ScreenA} />
      <TabNavigator.Screen name="ScreenB" component={ScreenB} />
    </TabNavigator.Navigator>
  );
};

export default Tab;
