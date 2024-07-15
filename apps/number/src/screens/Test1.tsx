import React from 'react';
import {Text, View} from 'react-native';
import {ID_COLOR} from '../constants';

const Test1 = () => {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: ID_COLOR,
      }}>
      <View style={{marginBottom: 10, alignItems: 'center'}}>
        <Text style={{fontSize: 30, fontWeight: 'bold'}}>Test1</Text>
      </View>
    </View>
  );
};

export default Test1;
