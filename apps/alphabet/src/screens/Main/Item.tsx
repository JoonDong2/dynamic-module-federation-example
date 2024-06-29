import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {Pressable, Text} from 'react-native';
import {NavigationProp} from 'shared/navigation';

interface Props {
  char: string;
}

const Item = ({char}: Props) => {
  const navigation = useNavigation<NavigationProp<'alphabet:Main'>>();

  return (
    <Pressable
      style={{padding: 10}}
      onPress={() => {
        navigation.push('alphabet:Detail', {char});
      }}>
      <Text>{char}</Text>
    </Pressable>
  );
};

export default Item;
