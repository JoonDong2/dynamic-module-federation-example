import {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {View, Text, Pressable, Alert} from 'react-native';
import {StackParamList} from './types';

type Props = StackScreenProps<StackParamList, 'ScreenD'>;

const ScreenD = ({navigation}: Props) => {
  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <Text>Screen D</Text>
    </View>
  );
};

export default ScreenD;
