import React from 'react';
import {FlatList, Text, View} from 'react-native';
import data from '../../data';
import Item from './Item';

const ItemSeparatorComponent = () => (
  <View style={{height: 1, width: '100%', backgroundColor: 'gray'}} />
);

const Main = () => {
  return (
    <View style={{flex: 1, backgroundColor: 'azure'}}>
      <View style={{alignItems: 'center', padding: 10}}>
        <Text>Number Main</Text>
      </View>
      <ItemSeparatorComponent />
      <FlatList
        data={data}
        renderItem={({index}) => {
          return <Item number={index} />;
        }}
        ItemSeparatorComponent={ItemSeparatorComponent}
      />
    </View>
  );
};

export default Main;