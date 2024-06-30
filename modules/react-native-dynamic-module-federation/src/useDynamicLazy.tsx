import React, {
  Component,
  Suspense,
  useContext,
  useRef,
  type FunctionComponent,
  type PropsWithChildren,
  type ReactElement,
  type ReactNode,
} from 'react';
import { Federated } from '@callstack/repack/client';
import { Context } from './DynamicImportProvider';
import { ErrorBoundary } from 'react-error-boundary';
import useMemoWithPrev from './useMemoWithPrev';

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
          const NewOriginLazy = React.lazy(() =>
            Federated.importModule(containerName, moduleName)
          );

          const NewLazy = (props: P) => {
            return (
              [
                [ErrorBoundary, options?.fallbacks?.error],
                [Suspense, options?.fallbacks?.suspense],
              ] as [
                React.ComponentType<
                  PropsWithChildren<{ fallback: React.ReactNode }>
                >,
                React.ReactNode,
              ][]
            ).reduceRight(
              (acc, [Wrapper, fallback]) => {
                if (!React.isValidElement(fallback)) return acc;
                return <Wrapper fallback={fallback}>{acc}</Wrapper>;
              },
              <NewOriginLazy {...props} />
            );
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
