"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getLocalhost = void 0;
var _reactNative = require("react-native");
const getLocalhost = () => {
  if (_reactNative.Platform.OS === 'android') {
    return '10.0.2.2';
  }
  return 'localhost';
};
exports.getLocalhost = getLocalhost;
//# sourceMappingURL=localhost.js.map