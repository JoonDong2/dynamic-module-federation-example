import React, {
  type PropsWithChildren,
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
  createContext,
} from 'react';
import {
  type ScriptLocatorResolver,
  ScriptManager,
} from '@callstack/repack/client';
import { generateResolver } from './resolver';
import getSymetricDifference from './getSymetricDifference';

declare global {
  var disposeContainer:
    | undefined
    | {
        [containerName: string]:
          | undefined
          | ((deleteScript?: boolean) => void | Promise<void>);
      };
}

export interface Containers {
  [name: string]: string; // uri
}

interface ContextProps {
  containers?: Containers;
}

const initialContext: ContextProps = {
  containers: undefined,
};

export const Context: React.Context<ContextProps> =
  createContext(initialContext);

export interface Props {
  fetchContainers: () =>
    | Containers
    | undefined
    | Promise<Containers | undefined>;
  deleteCacheFilesWhenRefresh?: boolean;
  suspense?: boolean;
}

type Status = 'pending' | 'success' | 'error';

export interface DynamicImportProviderHandle {
  refresh: (deleteScript?: boolean) => void;
}

export const DynamicImportProvider = forwardRef<
  DynamicImportProviderHandle,
  PropsWithChildren<Props>
>(
  (
    { children, fetchContainers, deleteCacheFilesWhenRefresh, suspense },
    ref
  ) => {
    const resolver = useRef<ScriptLocatorResolver>();

    const status = useRef<Status>('pending');
    const [containers, setContainers] = useState<Containers>();
    const [promiseOrError, setPromiseOrError] = useState<any>();

    const refresh = () => {
      const success = async (
        prevContainers?: Containers,
        newContainers?: Containers
      ) => {
        if (!newContainers) return;

        const difference = getSymetricDifference(prevContainers, newContainers);
        if (difference.length === 0) return;

        status.current = 'success';
        const newResolver = generateResolver(newContainers);
        ScriptManager.shared.addResolver(newResolver);
        if (resolver.current) {
          ScriptManager.shared.removeResolver(resolver.current);
        }
        resolver.current = newResolver;

        const promises: Promise<void>[] = [];
        difference.forEach((containerName) => {
          // 첫 번째 container가 로드되기 전에 global.disposeContainers는 undefined다.
          // 즉, 앱이 실행될 때는 globalDispose가 실행되지 않고, 아래 setContainers가 설정되고 conainers가 로드된 후에, 외부에서 refresh()를 호출했을 때 disposeContainers가 실행된다.
          // 이것은 의도된 동작이다.
          const maybePromise = global.disposeContainer?.[containerName]?.(
            deleteCacheFilesWhenRefresh
          );
          if (maybePromise instanceof Promise) {
            promises.push(maybePromise);
          }
        });

        await Promise.all(promises);
        setContainers(newContainers);
      };

      const error = (e: any) => {
        status.current = 'error';
        setPromiseOrError(e);
      };

      setContainers((prevContainer) => {
        try {
          const containersOrPromise = fetchContainers();

          if (containersOrPromise instanceof Promise) {
            status.current = 'pending';

            containersOrPromise
              .then((newContainers) => {
                success(prevContainer, newContainers);
              })
              .catch(error);

            setPromiseOrError(containersOrPromise);
          } else {
            success(prevContainer, containersOrPromise);
          }
        } catch (e) {
          error(e);
        }

        return prevContainer; // 무조건 이전값 반환, 업데이트 판단용
      });
    };

    useImperativeHandle(ref, () => {
      return {
        refresh,
      };
    });

    useEffect(() => {
      refresh();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (
      suspense &&
      status.current !== 'success' &&
      promiseOrError &&
      // containers가 있다면 Promise나 Error를 다시 던지지 않는다.
      // 필요하다면 useDynamicLazy/Module에서 던질 것이다.
      !containers
    ) {
      throw promiseOrError;
    }

    return (
      <Context.Provider value={{ containers }}>{children}</Context.Provider>
    );
  }
);

export default DynamicImportProvider;
