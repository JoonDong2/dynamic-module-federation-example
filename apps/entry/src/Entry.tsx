import React from 'react';
import {View, Text, Pressable, Alert} from 'react-native';

const Entry = () => {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <Pressable
        onPress={() => {
          Alert.alert('Entry');
        }}>
        <Text>Entry</Text>
      </Pressable>
    </View>
  );
};

export default Entry;
