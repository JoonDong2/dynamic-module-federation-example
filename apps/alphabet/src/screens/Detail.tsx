import React, {useMemo} from 'react';
import {Pressable, Text, View} from 'react-native';
import data from '../data';
import {useNavigation, useRoute} from '@react-navigation/native';
import {NavigationProp, RouteProp} from 'shared/navigation';
import {ID_COLOR} from '../constants';

const Detail = () => {
  const navigation = useNavigation<NavigationProp<'alphabet:Main'>>();
  const route = useRoute<RouteProp<'alphabet:Detail'>>();
  const {char} = route.params;
  const relatedNumber = useMemo(() => {
    return data.findIndex(c => c === char);
  }, [char]);
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: ID_COLOR,
      }}>
      <View style={{marginBottom: 10, alignItems: 'center'}}>
        <Text style={{fontSize: 30, fontWeight: 'bold'}}>{char}</Text>
      </View>
      {relatedNumber !== -1 && (
        <Pressable
          onPress={() => {
            navigation.push('number:Detail', {number: relatedNumber});
          }}
          style={{alignItems: 'center'}}>
          <Text>{`related number: ${relatedNumber}`}</Text>
        </Pressable>
      )}
    </View>
  );
};

export default Detail;
