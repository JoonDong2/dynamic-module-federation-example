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
          | ((deleteCacheFile?: boolean) => void);
      };
  var deleteCacheFile:
    | undefined
    | {
        [containerName: string]:
          | undefined
          | ((deleteCacheFile?: boolean) => Promise<void> | undefined); // 삭제할 파일이 있다면 Promise가 반환된다.
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
  fetchContainers: () => Containers | Promise<Containers>;
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

    const updateResolver = (containers: Containers) => {
      const newResolver = generateResolver(containers);

      if (resolver.current) {
        const resolverToDelete = resolver.current;
        ScriptManager.shared.removeResolver(resolverToDelete);
      }

      ScriptManager.shared.addResolver(newResolver);

      resolver.current = newResolver;
    };

    const status = useRef<Status>('pending');
    const [containers, setContainers] = useState<Containers>();
    const [promiseOrError, setPromiseOrError] = useState<any>();

    const _onError = (e: any) => {
      status.current = 'error';
      setPromiseOrError(e);
    };

    const disposeContainer = (containerName: string) => {
      global.disposeContainer?.[containerName]?.();

      if (!deleteCacheFilesWhenRefresh) return;
      return global.deleteCacheFile?.[containerName]?.();
    };

    const _onSuccess = async (newContainers: Containers) => {
      const difference = getSymetricDifference(containers, newContainers);

      if (difference.length === 0) return;

      // 컨테이너를 업데이트하기 전에 resolver를 미리 변경시켜 놓는다.
      updateResolver(newContainers);

      const deleteTasks: Promise<void>[] = [];
      difference.forEach((containerName) => {
        const deleteTask = disposeContainer(containerName);
        if (deleteTask) {
          deleteTasks.push(deleteTask);
        }
      });

      if (deleteTasks.length > 0) {
        await Promise.all(deleteTasks);
      }

      status.current = 'success';
      setContainers(newContainers);
    };

    const refresh = () => {
      try {
        const containersOrPromise = fetchContainers();

        if (containersOrPromise instanceof Promise) {
          const promise = containersOrPromise;

          promise.then(_onSuccess).catch(_onError);

          status.current = 'pending';
          setPromiseOrError(containersOrPromise);
        } else {
          const newContainers = containersOrPromise;
          _onSuccess(newContainers);
        }
      } catch (e) {
        _onError(e);
      }
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
      <Context.Provider value={{ containers }}>
        <>{children}</>
      </Context.Provider>
    );
  }
);

export default DynamicImportProvider;
