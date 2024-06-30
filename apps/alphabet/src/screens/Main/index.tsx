import React from 'react';
import {FlatList, Text, View} from 'react-native';
import data from '../../data';
import Item from './Item';

const ItemSeparatorComponent = () => (
  <View style={{height: 1, width: '100%', backgroundColor: 'gray'}} />
);

const Alphabet = () => {
  return (
    <View style={{flex: 1, backgroundColor: 'beige'}}>
      <View style={{alignItems: 'center', padding: 10}}>
        <Text>Alphabet Main</Text>
      </View>
      <ItemSeparatorComponent />
      <FlatList
        data={data}
        renderItem={({item}) => {
          return <Item char={item} />;
        }}
        ItemSeparatorComponent={ItemSeparatorComponent}
      />
    </View>
  );
};

export default Alphabet;
