import {Alert} from 'react-native';

export const alert = (number: number) => {
  Alert.alert(String(number));
};
