"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getDevContainers = exports.fetchContainers = void 0;
var _reactNative = require("react-native");
var _reactNativeConfig = _interopRequireDefault(require("react-native-config"));
var _localhost = require("./localhost");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const getDevContainers = () => ({
  entry: `http://${(0, _localhost.getLocalhost)()}:9000/[name][ext]`,
  app1: `http://${(0, _localhost.getLocalhost)()}:9001/[name][ext]`,
  app2: `http://${(0, _localhost.getLocalhost)()}:9002/[name][ext]`
});
exports.getDevContainers = getDevContainers;
const CONTAINERS_SERVER_URI = `http://${(0, _localhost.getLocalhost)()}:4000/containers`;
const fetchContainers = async () => {
  if (_reactNativeConfig.default.ENV === 'development') {
    return getDevContainers();
  }
  const params = {
    env: _reactNativeConfig.default.ENV,
    os: _reactNative.Platform.OS,
    native_version: _reactNativeConfig.default.NATIVE_VERSION
  };
  const queryString = new URLSearchParams(params).toString();
  const res = await fetch(`${CONTAINERS_SERVER_URI}?${queryString}`);
  const containers = Object.fromEntries(Object.entries(await res.json()).map(([containerName, path]) => {
    return [containerName, `http://${(0, _localhost.getLocalhost)()}:4000/${path}/[name][ext]`];
  }));
  return containers;
};
exports.fetchContainers = fetchContainers;
//# sourceMappingURL=containers.js.map