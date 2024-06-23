"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = require("react");
var _reactNative = require("react-native");
// 포그라운드 -> 백그라운드로 이동할 때 실행

// 앱 시작시 또는 백그라운드 -> 포그라운드로 이동할 때 실행하는 함수

// iOS inactive 상태 무시
const useForeground = callback => {
  const appState = (0, _react.useRef)(_reactNative.AppState.currentState);
  const backgroundCallback = (0, _react.useRef)();

  // 가끔 삭제가 되지 않는 것 같아 외부에서 모아서 관리
  const subscriptions = (0, _react.useRef)([]);
  (0, _react.useEffect)(() => {
    const result = callback();
    if (result) {
      backgroundCallback.current = result;
    }
  }, []);
  (0, _react.useEffect)(() => {
    const subscription = _reactNative.AppState.addEventListener('change', async nextAppState => {
      // to background
      if (backgroundCallback.current && nextAppState === 'background') {
        if (backgroundCallback.current instanceof Promise) {
          backgroundCallback.current = await backgroundCallback.current;
        }
        if (!(backgroundCallback.current instanceof Promise) && typeof backgroundCallback.current === 'function') {
          backgroundCallback.current();
        }
      }
      // background -> foreground
      else if (appState.current === 'background' && nextAppState === 'active') {
        const result = callback();
        if (result) {
          backgroundCallback.current = result;
        }
      }
      appState.current = nextAppState;
    });
    subscriptions.current.push(subscription);
    return () => {
      if (subscriptions.current.length > 0) {
        subscriptions.current.forEach(subscription => {
          subscription.remove();
        });
        subscriptions.current = [];
      }
    };
  }, [callback]);
};
var _default = exports.default = useForeground;
//# sourceMappingURL=useForeground.js.map