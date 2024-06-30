import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {Pressable, Text} from 'react-native';
import {NavigationProp} from 'shared/navigation';

interface Props {
  code: string;
}

const Item = ({code}: Props) => {
  const navigation = useNavigation<NavigationProp<'alphabet:Main'>>();

  return (
    <Pressable
      style={{padding: 10}}
      onPress={() => {
        navigation.push('emoji:Detail', {code});
      }}>
      <Text>{code}</Text>
    </Pressable>
  );
};

export default Item;
