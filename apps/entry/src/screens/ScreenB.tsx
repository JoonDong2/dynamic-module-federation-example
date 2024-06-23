import {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import {CompositeScreenProps} from '@react-navigation/native';
import {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {View, Text} from 'react-native';
import {StackParamList, TabParamList} from './types';

type ProfileScreenProps = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'ScreenB'>,
  StackScreenProps<StackParamList>
>;

const ScreenB = ({}: ProfileScreenProps) => {
  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <Text>Screen B</Text>
    </View>
  );
};

export default ScreenB;
