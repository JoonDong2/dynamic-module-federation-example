import { Platform } from 'react-native';
export const getLocalhost = () => {
  if (Platform.OS === 'android') {
    return '10.0.2.2';
  }
  return 'localhost';
};
//# sourceMappingURL=localhost.js.map