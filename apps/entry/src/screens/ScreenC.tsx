import React from 'react';
import {View, Text, Pressable} from 'react-native';
import {StackParamList} from './types';
import {StackScreenProps} from '@react-navigation/stack';

type Props = StackScreenProps<StackParamList, 'ScreenC'>;

const ScreenC = ({navigation, route}: Props) => {
  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <Pressable
        onPress={() => {
          navigation.push('ScreenD');
        }}>
        <Text>Screen C</Text>
      </Pressable>
    </View>
  );
};

export default ScreenC;
