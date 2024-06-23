import React, {PropsWithChildren, useCallback, useRef, useState} from 'react';
import {
  ImportModuleProvider,
  type Containers,
} from 'react-native-dynamic-module-federation';
import useForeground from '../hooks/useForeground';
import {ScriptLocatorResolver, ScriptManager} from '@callstack/repack/client';
import {fetchContainers, generateResolver} from 'shared';

const ContainersProvider = ({children}: PropsWithChildren<{}>) => {
  const resolver = useRef<ScriptLocatorResolver>();
  const [containers, setContainers] = useState<Containers | null>(null);

  useForeground(
    useCallback(async () => {
      // 서버에서 컨테이너 정보를 가져온다.
      const newContainers = await fetchContainers();
      const newResolver = generateResolver(newContainers);
      ScriptManager.shared.addResolver(newResolver);
      if (resolver.current) {
        console.log('resolver 갱신', newContainers);
        ScriptManager.shared.removeResolver(resolver.current);
      }
      resolver.current = newResolver;
      setContainers(newContainers);
    }, []),
  );

  if (containers === null) {
    return null;
  }

  return (
    <ImportModuleProvider containers={containers}>
      {children}
    </ImportModuleProvider>
  );
};

export default ContainersProvider;
