import React, { type PropsWithChildren, useEffect, useRef } from 'react';

export interface ContextProps {
  containers?: Containers;
}

const initialContext: ContextProps = {
  containers: {},
};

export const Context: React.Context<ContextProps> =
  React.createContext(initialContext);

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

const getSymetricDifference = (a: Containers = {}, b: Containers = {}) => {
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
  const containers = useRef<Containers | undefined>(newContainers);

  useEffect(() => {
    if (!newContainers) return;
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
