import React from 'react';
import {View, Text, Pressable} from 'react-native';
import {StackParamList, TabParamList} from './types';
import {CompositeScreenProps} from '@react-navigation/native';
import {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import {StackScreenProps} from '@react-navigation/stack';

type ProfileScreenProps = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'ScreenA'>,
  StackScreenProps<StackParamList>
>;

const ScreenA = ({navigation}: ProfileScreenProps) => {
  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <Pressable
        onPress={() => {
          navigation.push('ScreenC');
        }}>
        <Text>Screen A</Text>
      </Pressable>
    </View>
  );
};

export default ScreenA;
