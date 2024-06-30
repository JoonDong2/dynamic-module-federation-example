import React, {
  Component,
  Suspense,
  useContext,
  useEffect,
  useRef,
  useState,
  type FunctionComponent,
  type ReactElement,
  type ReactNode,
} from 'react';
import { Federated } from '@callstack/repack/client';
import { Context } from './DynamicImportProvider';
import { ErrorBoundary } from 'react-error-boundary';

const Null = () => null;

export function useDynamicLazy<P = any>(
  containerName: string,
  moduleName: string,
  options?: {
    fallbacks?: {
      suspense?: ReactNode;
      error?: ReactElement<
        unknown,
        string | FunctionComponent | typeof Component
      > | null;
    };
  }
): (props: P) => JSX.Element | null {
  const SuspenseFallback = options?.fallbacks?.suspense ?? null;
  const ErrorBoundaryFallback = options?.fallbacks?.error ?? null;

  const { containers } = useContext(Context);

  const uri = useRef(containers?.[containerName]);

  const [Lazy, setLazy] = useState<(props: any) => JSX.Element>();

  useEffect(() => {
    setLazy((prev?: (props: P) => JSX.Element) => {
      const newUri = containers?.[containerName];
      if (newUri) {
        if (!prev || uri.current !== newUri) {
          uri.current = newUri;
          // 익명 컴포넌트가 아니면 밖에서 컴포넌트 내용이 변경된 것을 인식하지 못한다.
          // Promise를 대신 던져준다.
          const NewLazy = React.lazy(() =>
            Federated.importModule(containerName, moduleName)
          );

          return (props: P) => {
            return (
              <ErrorBoundary fallback={ErrorBoundaryFallback}>
                <Suspense fallback={SuspenseFallback}>
                  <NewLazy {...props} />
                </Suspense>
              </ErrorBoundary>
            );
          };
        }
      }
      return prev;
    });
    // containers가 변경될 때만 실행되면 되므로, Wrapper를 의존성 배열에 등록할 필요는 없다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containers, containerName, moduleName]);

  return Lazy ?? Null;
}

export default useDynamicLazy;
