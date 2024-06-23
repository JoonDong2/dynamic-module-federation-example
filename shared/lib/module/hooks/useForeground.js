import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

// 포그라운드 -> 백그라운드로 이동할 때 실행

// 앱 시작시 또는 백그라운드 -> 포그라운드로 이동할 때 실행하는 함수

// iOS inactive 상태 무시
const useForeground = callback => {
  const appState = useRef(AppState.currentState);
  const backgroundCallback = useRef();

  // 가끔 삭제가 되지 않는 것 같아 외부에서 모아서 관리
  const subscriptions = useRef([]);
  useEffect(() => {
    const result = callback();
    if (result) {
      backgroundCallback.current = result;
    }
  }, []);
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async nextAppState => {
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
export default useForeground;
//# sourceMappingURL=useForeground.js.map