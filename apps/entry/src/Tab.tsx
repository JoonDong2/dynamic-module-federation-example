import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {TabParamList} from 'shared/navigation';
import {useDynamicLazy} from 'react-native-dynamic-module-federation';
import {Text} from 'react-native';

const TabNavigator = createBottomTabNavigator<TabParamList>();

const Tab = () => {
  const AlphabetMain = useDynamicLazy('alphabet', './alphabet/screens/Main', {
    error: {
      fallback: <Text>Alphabet Main 오류</Text>,
    },
    suspenes: {
      fallback: <Text>Alphabet Main 로딩중</Text>,
    },
  });

  const NumberMain = useDynamicLazy('number', './number/screens/Main', {
    error: {
      fallback: <Text>Number Main 오류</Text>,
    },
    suspenes: {
      fallback: <Text>Number Main 로딩중</Text>,
    },
  });

  // const EmojiMain = useDynamicLazy('emoji', './emoji/screens/Main', {
  //   error: {
  //     fallback: <Text>Emoji Main 오류</Text>,
  //   },
  //   suspenes: {
  //     fallback: <Text>Emoji Main 로딩중</Text>,
  //   },
  // });

  return (
    <TabNavigator.Navigator screenOptions={{headerShown: false}}>
      <TabNavigator.Screen name="alphabet:Main" component={AlphabetMain} />
      <TabNavigator.Screen name="number:Main" component={NumberMain} />
      {/* <TabNavigator.Screen name="emoji:Main" component={EmojiMain} /> */}
    </TabNavigator.Navigator>
  );
};

export default Tab;
