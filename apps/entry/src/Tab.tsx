import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {TabParamList} from 'shared/navigation';
import {useDynamicLazy} from 'react-native-dynamic-module-federation';
import {Text} from 'react-native';

const TabNavigator = createBottomTabNavigator<TabParamList>();

const Tab = () => {
  const AlphabetMain = useDynamicLazy('alphabet', './alphabet/screens/Main', {
    fallbacks: {
      suspense: <Text>Alphabet Main 로딩중</Text>,
      error: <Text>Alphabet Main 오류</Text>,
    },
  });

  const NumberMain = useDynamicLazy('number', './number/screens/Main', {
    fallbacks: {
      suspense: <Text>Alphabet Main 로딩중</Text>,
      error: <Text>Alphabet Main 오류</Text>,
    },
  });

  return (
    <TabNavigator.Navigator screenOptions={{headerShown: false}}>
      <TabNavigator.Screen name="alphabet:Main" component={AlphabetMain} />
      <TabNavigator.Screen name="number:Main" component={NumberMain} />
    </TabNavigator.Navigator>
  );
};

export default Tab;
