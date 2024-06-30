import { useMemo, useRef, type DependencyList } from 'react';

function useMemoWithPrev<T>(
  factory: (prev: T | undefined) => T,
  deps: DependencyList
): T {
  const prev = useRef<T>();

  return useMemo(() => {
    const newValue = factory(prev.current);
    prev.current = newValue;
    return newValue;
    // 어차피 factory는 deps가 업데이트될 때 상태만 있으면 된다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export default useMemoWithPrev;
