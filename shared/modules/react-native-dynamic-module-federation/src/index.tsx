import { Federated } from "@callstack/repack/client";
import React, {
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

export interface Containers {
  [name: string]: string; // name: version
}
interface ContextProps {
  containers: Containers;
}

const Context: React.Context<ContextProps> = React.createContext({
  containers: {},
});

const isSameContainers = (a: Containers, b: Containers) => {
  if (a === b) {
    return true;
  }

  if (Object.keys(a).length !== Object.keys(b).length) {
    return false;
  }

  const entries = Object.entries(b);

  for (let i = 0; i < entries.length; i++) {
    const [containerName, version] = entries[i] as [string, string];

    if (a[containerName] !== version) {
      return false;
    }
  }

  return true;
};

const ImportModuleProvider = ({
  children,
  containers: newContainers,
}: PropsWithChildren<ContextProps>) => {
  const [containers, setContainers] = useState<Containers>(newContainers);

  useEffect(() => {
    setContainers((prevContainers) => {
      try {
        if (isSameContainers(prevContainers, newContainers)) {
          return prevContainers;
        }
        return newContainers;
      } catch {
        return prevContainers;
      }
    });
  }, [newContainers]);

  return <Context.Provider value={{ containers }}>{children}</Context.Provider>;
};

const useImportModule = (containerName: string, moduleName: string) => {
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

export default {
  ImportModuleProvider,
  useImportModule,
};
