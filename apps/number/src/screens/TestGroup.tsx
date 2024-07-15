import React from 'react';
import Test1 from './Test1';
import Test2 from './Test2';
import {createStackNavigator} from '@react-navigation/stack';

export const StackNavigator = createStackNavigator();

const TestGroup = (
  <>
    <StackNavigator.Screen name="number:Test1" component={Test1} />
    <StackNavigator.Screen name="number:Test2" component={Test2} />
  </>
);

export default TestGroup;
