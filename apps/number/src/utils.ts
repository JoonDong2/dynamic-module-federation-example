import {Alert} from 'react-native';

export const alertNumber = (num: number) => {
  Alert.alert(String(num));
};
