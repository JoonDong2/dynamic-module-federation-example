import React from 'react';
import {FlatList, Text, View} from 'react-native';
import data from '../../data';
import Item from './Item';
import {ID_COLOR} from '../../constants';

const ItemSeparatorComponent = () => (
  <View style={{height: 1, width: '100%', backgroundColor: 'gray'}} />
);

const Main = () => {
  return (
    <View style={{flex: 1, backgroundColor: ID_COLOR}}>
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

export default Main;
