import { Federated } from "@callstack/repack/client";
import React, {
  useContext,
  useEffect,
  useRef,
  useState,
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
      containers.current = newContainers;
    } catch {}
  }, [newContainers]);

  return (
    <Context.Provider value={{ containers: newContainers }}>
      {children}
    </Context.Provider>
  );
};

const Null: React.FunctionComponent = () => null;

export const useImportModule = (
  containerName: string,
  moduleName: string
):
  | React.LazyExoticComponent<React.ComponentType<any>>
  | React.FunctionComponent<{}> => {
  const { containers } = useContext(Context);

  const version = containers[containerName];

  const prevVersion = useRef(version);
  const [Lazy, setLazy] =
    useState<React.LazyExoticComponent<React.ComponentType<any>>>();

  useEffect(() => {
    setLazy(
      (
        prev: React.LazyExoticComponent<React.ComponentType<any>> | undefined
      ) => {
        if (version) {
          if (!prev || prevVersion.current !== version) {
            prevVersion.current = version;
            return React.lazy(() =>
              Federated.importModule(containerName, moduleName)
            );
          }
        }
        return prev;
      }
    );
  }, [containerName, version]);

  // 익명 컴포넌트가 아니면 밖에서 컴포넌트 내용이 변경된 것을 인식하지 못한다.
  return (props: any) => {
    return Lazy ? <Lazy {...props} /> : <Null />;
  };
};
