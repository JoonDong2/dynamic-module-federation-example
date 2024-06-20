import { Federated } from "@callstack/repack/client";
import React, {
  useContext,
  useEffect,
  useMemo,
  useRef,
  type PropsWithChildren,
} from "react";
export interface Containers {
  [name: string]: string; // name: version
}

declare global {
  var disposeContainer:
    | undefined
    | {
        [containerName: string]: undefined | (() => void);
      };
}

interface ContextProps {
  containers: Containers;
}

const Context: React.Context<ContextProps> = React.createContext({
  containers: {},
});

const getSymetricDifference = (a: Containers, b: Containers) => {
  const result = new Set<string>();

  Object.entries(a).forEach(([containerName, version]) => {
    if (b?.[containerName] !== version) {
      result.add(containerName);
    }
  });

  Object.entries(b).forEach(([containerName, version]) => {
    if (a?.[containerName] !== version) {
      result.add(containerName);
    }
  });

  return [...result];
};

export const ImportModuleProvider = ({
  children,
  containers: newContainers,
}: PropsWithChildren<ContextProps>) => {
  const containers = useRef<Containers>(newContainers);

  useEffect(() => {
    try {
      const changedContainers = getSymetricDifference(
        containers.current,
        newContainers
      );
      changedContainers.forEach((containerName) => {
        global.disposeContainer?.[containerName]?.();
      });
    } catch {}
  }, [newContainers]);

  return (
    <Context.Provider value={{ containers: newContainers }}>
      {children}
    </Context.Provider>
  );
};

export const useImportModule = (containerName: string, moduleName: string) => {
  const { containers } = useContext(Context);

  const version = containers[containerName];

  const MaybeLazy = useMemo(() => {
    if (!version) {
      return null;
    }
    return React.lazy(() => Federated.importModule(containerName, moduleName));
  }, [containerName, version]);

  return MaybeLazy;
};
