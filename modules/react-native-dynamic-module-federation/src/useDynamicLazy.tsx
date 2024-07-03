import React, {
  Suspense,
  useContext,
  useRef,
  type ErrorInfo,
  type ReactNode,
} from 'react';
import { Federated } from '@callstack/repack/client';
import { Context } from './DynamicImportProvider';
import { ErrorBoundary, type ErrorBoundaryProps } from 'react-error-boundary';
import useMemoWithPrev from './useMemoWithPrev';

const Null = () => null;

export function useDynamicLazy<P = any>(
  containerName: string,
  moduleName: string,
  options?: {
    error?: ErrorBoundaryProps;
    suspenes?: {
      fallback?: ReactNode;
      timeout?: number;
      onTimeout?: () => void;
    };
  }
): (props: P) => JSX.Element | null {
  const { containers } = useContext(Context);

  const uri = useRef(containers?.[containerName]);

  const Lazy = useMemoWithPrev<undefined | ((props: P) => JSX.Element)>(
    (prev) => {
      const newUri = containers?.[containerName];
      if (newUri) {
        if (!prev || uri.current !== newUri) {
          uri.current = newUri;
          // 익명 컴포넌트가 아니면 밖에서 컴포넌트 내용이 변경된 것을 인식하지 못한다.
          // Promise를 대신 던져준다.
          const NewOriginLazy = React.lazy(() => {
            const promises = [
              Federated.importModule(containerName, moduleName),
            ];

            if (options?.suspenes?.timeout) {
              promises.push(
                new Promise((_, reject) => {
                  setTimeout(() => {
                    if (typeof options?.suspenes?.onTimeout === 'function') {
                      options.suspenes.onTimeout();
                    }
                    reject(new Error('useDynamicLazy Timeout'));
                  }, options!.suspenes!.timeout);
                })
              );
            }

            return Promise.race(promises);
          });

          const NewLazy = (props: P) => {
            let component = <NewOriginLazy {...props} />;
            if (options?.suspenes?.fallback) {
              component = (
                <Suspense fallback={options.suspenes.fallback}>
                  {component}
                </Suspense>
              );
            }
            if (options?.error) {
              const onError = (error: Error, info: ErrorInfo) => {
                uri.current = undefined; // 다음 컨테이너 업데이트시 memo 재계산하기 위해서
                options?.error?.onError?.(error, info);
              };
              component = (
                <ErrorBoundary {...options.error} onError={onError}>
                  {component}
                </ErrorBoundary>
              );
            }

            return component;
          };

          return NewLazy;
        }
      }
      return prev;
      // 어차피 버전때문에 prev가 반환되지만, containers가 변경될 때 상태만 가져오면 되므로, fallbacks를 의존성 배열에 등록할 필요는 없다.
    },
    [containers, containerName, moduleName]
  );

  return Lazy ?? Null;
}

export default useDynamicLazy;
