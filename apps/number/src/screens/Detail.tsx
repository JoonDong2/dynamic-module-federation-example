import React from 'react';
import {Pressable, Text, View} from 'react-native';
import data from '../data';
import {useNavigation, useRoute} from '@react-navigation/native';
import {NavigationProp, RouteProp} from 'shared/navigation';
import {ID_COLOR} from '../constants';

const Detail = () => {
  const navigation = useNavigation<NavigationProp<'number:Main'>>();
  const route = useRoute<RouteProp<'number:Detail'>>();
  const {number} = route.params;
  const relatedChar = data[number];
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: ID_COLOR,
      }}>
      <View style={{marginBottom: 10, alignItems: 'center'}}>
        <Text style={{fontSize: 30, fontWeight: 'bold'}}>{number}</Text>
      </View>
      {relatedChar && (
        <Pressable
          onPress={() => {
            navigation.push('alphabet:Detail', {char: relatedChar});
          }}
          style={{alignItems: 'center'}}>
          <Text>{`related char: ${relatedChar}`}</Text>
        </Pressable>
      )}
      <Pressable
        onPress={() => {
          navigation.push('number:Test1');
        }}>
        <Text>Test1</Text>
      </Pressable>
      <Pressable
        onPress={() => {
          navigation.push('number:Test2');
        }}>
        <Text>Test2</Text>
      </Pressable>
    </View>
  );
};

export default Detail;
