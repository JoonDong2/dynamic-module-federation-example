import React, { PropsWithChildren, useEffect, useRef } from "react";

export const Context: React.Context<ContextProps> = React.createContext({
  containers: {},
});

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

export interface ContextProps {
  containers: Containers;
}

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

export default ImportModuleProvider;
