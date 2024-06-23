"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.generateResolver = void 0;
var _client = require("@callstack/repack/client");
var _reactNative = require("react-native");
const generateResolver = containers => {
  return (scriptId, caller) => {
    const resolveURL = _client.Federated.createURLResolver({
      containers
    });
    let url;
    if (__DEV__ && caller === 'main') {
      url = _client.Script.getDevServerURL(scriptId);
    } else {
      url = resolveURL(scriptId, caller);
    }
    if (!url) {
      return undefined;
    }
    return {
      url,
      cache: !__DEV__,
      query: {
        platform: _reactNative.Platform.OS // only needed in development
      },
      verifyScriptSignature: 'off'
    };
  };
};
exports.generateResolver = generateResolver;
//# sourceMappingURL=resolver.js.map