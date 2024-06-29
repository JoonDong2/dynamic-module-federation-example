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
        [containerName: string]: undefined | (() => void);
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
  deleteScriptWhenRefresh?: boolean;
}

type Status = 'pending' | 'success' | 'error';

export interface DynamicImportProviderHandle {
  refresh: () => void;
}

export const DynamicImportProvider = forwardRef<
  DynamicImportProviderHandle,
  PropsWithChildren<Props>
>(({ children, fetchContainers }, ref) => {
  const resolver = useRef<ScriptLocatorResolver>();

  const status = useRef<Status>('pending');
  const [containers, setContainers] = useState<Containers>();
  const [promiseOrError, setPromiseOrError] = useState<any>();

  const refresh = () => {
    const success = (newContainers?: Containers) => {
      if (newContainers) {
        status.current = 'success';
        const newResolver = generateResolver(newContainers);
        ScriptManager.shared.addResolver(newResolver);
        if (resolver.current) {
          ScriptManager.shared.removeResolver(resolver.current);
        }
        resolver.current = newResolver;

        const changedContainers = getSymetricDifference(
          containers,
          newContainers
        );

        changedContainers.forEach((containerName) => {
          global.disposeContainer?.[containerName]?.();
        });

        setContainers(newContainers);
      }
    };

    const error = (e: any) => {
      status.current = 'error';
      setPromiseOrError(e);
    };

    try {
      const containersOrPromise = fetchContainers();
      if (containersOrPromise instanceof Promise) {
        status.current = 'pending';
        containersOrPromise
          .then((newContainers) => {
            success(newContainers);
          })
          .catch(error);
        setPromiseOrError(containersOrPromise);
      } else {
        success(containersOrPromise);
      }
    } catch (e) {
      error(e);
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

  if (status.current !== 'success' && promiseOrError) {
    throw promiseOrError;
  }

  return <Context.Provider value={{ containers }}>{children}</Context.Provider>;
});

export default DynamicImportProvider;
