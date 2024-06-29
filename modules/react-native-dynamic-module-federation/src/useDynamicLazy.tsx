import React, {
  useContext,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import { Federated } from '@callstack/repack/client';
import { Context } from './DynamicImportProvider';

const Null = () => null;

export function useDynamicLazy<P = any>(
  containerName: string,
  moduleName: string,
  options?: {
    wrapper: (props: PropsWithChildren) => React.ReactElement;
  }
): (props: P) => JSX.Element | null {
  const Wrapper = options?.wrapper;
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
            if (Wrapper) {
              return (
                <Wrapper>
                  <NewLazy {...props} />
                </Wrapper>
              );
            }
            return <NewLazy {...props} />;
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
