import React, {useEffect, useState} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';
import Tab from './Tab';
import ScreenC from './screens/ScreenC';
import ScreenD from './screens/ScreenD';
import {StackParamList} from './screens/types';

const StackNavigator = createStackNavigator<StackParamList>();

const Stack = () => {
  const [test, setTest] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setTest(false);
    }, 3000);
  }, []);

  return (
    <NavigationContainer>
      <StackNavigator.Navigator>
        <StackNavigator.Screen name="Tab" component={Tab} />
        {test && <StackNavigator.Screen name="ScreenC" component={ScreenC} />}
        <StackNavigator.Screen name="ScreenD" component={ScreenD} />
      </StackNavigator.Navigator>
    </NavigationContainer>
  );
};

export default Stack;
