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
        // 익명 컴포넌트가 아니면 밖에서 컴포넌트 내용이 변경된 것을 인식하지 못한다.
        // Promise를 대신 던져준다.
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

  if (status.current !== 'success' && promiseOrError && suspense && !module) {
    throw promiseOrError;
  }

  return { module, isPending: status.current === 'pending' };
}

export default useDynamicModule;
