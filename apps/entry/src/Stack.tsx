import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import Tab from './Tab';
import {RootStackParamList} from 'shared/navigation';
import {useDynamicLazy} from 'react-native-dynamic-module-federation';
import {Text} from 'react-native';

const StackNavigator = createStackNavigator<
  RootStackParamList & {
    Tab: undefined;
  }
>();

const Stack = () => {
  const AlphabetDetail = useDynamicLazy(
    'alphabet',
    './alphabet/screens/Detail',
    {
      error: {
        fallback: <Text>Alphabet Detail 오류</Text>,
      },
      suspenes: {
        fallback: <Text>Alphabet Detail 로딩중</Text>,
      },
    },
  );

  const NumberDetail = useDynamicLazy('number', './number/screens/Detail', {
    error: {
      fallback: <Text>Number Detail 오류</Text>,
    },
    suspenes: {
      fallback: <Text>Number Detail 로딩중</Text>,
    },
  });

  // const EmojiDetail = useDynamicLazy('emoji', './emoji/screens/Detail', {
  //   error: {
  //     fallback: <Text>Emoji Detail 오류</Text>,
  //   },
  //   suspenes: {
  //     fallback: <Text>Emoji Detail 로딩중</Text>,
  //   },
  // });

  return (
    <StackNavigator.Navigator screenOptions={{headerShown: false}}>
      <StackNavigator.Screen name="Tab" component={Tab} />
      <StackNavigator.Screen
        name="alphabet:Detail"
        component={AlphabetDetail}
      />
      <StackNavigator.Screen name="number:Detail" component={NumberDetail} />
      {/* <StackNavigator.Screen name="emoji:Detail" component={EmojiDetail} /> */}
    </StackNavigator.Navigator>
  );
};

export default Stack;
