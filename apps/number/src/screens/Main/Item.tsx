import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {Pressable, Text} from 'react-native';
import {NavigationProp} from 'shared/navigation';

interface Props {
  number: number;
}

const Item = ({number}: Props) => {
  const navigation = useNavigation<NavigationProp<'alphabet:Main'>>();

  return (
    <Pressable
      style={{padding: 10}}
      onPress={() => {
        navigation.push('number:Detail', {number});
      }}>
      <Text>{number}</Text>
    </Pressable>
  );
};

export default Item;
