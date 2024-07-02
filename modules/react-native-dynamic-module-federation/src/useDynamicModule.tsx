import { useContext, useEffect, useRef, useState } from 'react';
import { Federated } from '@callstack/repack/client';
import { Context } from './DynamicImportProvider';

type Status = 'pending' | 'success' | 'error';

export function useDynamicModule<T = any>(
  containerName: string,
  moduleName: string,
  options?: {
    suspense?: boolean;
  }
): { module?: T; isPending: boolean } {
  const suspense = options?.suspense || false;
  const { containers } = useContext(Context);

  const uri = useRef(containers?.[containerName]);

  const status = useRef<Status>('pending');
  const [promiseOrError, setPromiseOrError] = useState<any>();
  const [module, setModule] = useState<T>();

  useEffect(() => {
    const newUri = containers?.[containerName];
    if (newUri) {
      if (uri.current !== newUri) {
        uri.current = newUri;
        const promise = Federated.importModule<T>(containerName, moduleName);
        status.current = 'pending';
        promise
          .then((newModule) => {
            status.current = 'success';
            setModule(newModule);
          })
          .catch((e: any) => {
            status.current = 'error';
            setPromiseOrError(e);
          });
        setPromiseOrError(promise);
      }
    }
  }, [containers, containerName, moduleName]);

  if (suspense && status.current !== 'success' && promiseOrError && !module) {
    throw promiseOrError;
  }

  return { module, isPending: status.current === 'pending' };
}

export default useDynamicModule;
