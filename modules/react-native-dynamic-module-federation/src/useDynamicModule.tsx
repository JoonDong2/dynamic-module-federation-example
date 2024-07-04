import { useContext, useEffect, useRef, useState } from 'react';
import { Federated } from '@callstack/repack/client';
import { Context } from './DynamicImportProvider';
import DynamicModuleError from './DynamicModuleError';

type Status = 'pending' | 'success' | 'error';

export function useDynamicModule<T = any>(
  containerName: string,
  moduleName: string,
  options?: {
    suspense?: boolean;
    error?: {
      throw?: boolean;
      onError?: (e: Error) => void;
    };
    timeout?: number;
    onTimeout?: () => void;
  }
): { module?: T; isPending: boolean; isError: boolean } {
  const suspense = options?.suspense || false;
  const { containers, delegateError } = useContext(Context);

  const status = useRef<Status>('pending');
  const [promiseOrError, setPromiseOrError] = useState<any>();
  const [module, setModule] = useState<T>();

  useEffect(() => {
    const uri = containers?.[containerName];
    if (uri) {
      const promises: Promise<T>[] = [
        Federated.importModule<T>(containerName, moduleName),
      ];
      if (options?.timeout) {
        promises.push(
          new Promise((_, reject) => {
            setTimeout(() => {
              reject(new Error('timeout'));
            }, options.timeout);
          })
        );
      }

      status.current = 'pending';
      const race = Promise.race(promises)
        .then((newModule) => {
          status.current = 'success';
          setModule(newModule);
        })
        .catch((e: Error) => {
          status.current = 'error';
          const dynamicModuleError = new DynamicModuleError(
            containerName,
            moduleName,
            e
          );
          options?.error?.onError?.(dynamicModuleError);
          delegateError(dynamicModuleError);
          setPromiseOrError(e);
        });
      setPromiseOrError(race);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containers?.[containerName], moduleName]);

  if (suspense && status.current === 'pending' && promiseOrError && !module) {
    throw promiseOrError;
  }

  if (
    options?.error?.throw &&
    status.current === 'error' &&
    promiseOrError &&
    !module
  ) {
    throw promiseOrError;
  }

  return {
    module,
    isPending: status.current === 'pending',
    isError: status.current === 'error',
  };
}

export default useDynamicModule;
