import React from "react";
export interface Containers {
    [name: string]: string;
}
interface ContextProps {
    containers: Containers;
}
declare const _default: {
    ImportModuleProvider: ({ children, containers: newContainers, }: React.PropsWithChildren<ContextProps>) => import("react/jsx-runtime").JSX.Element;
    useImportModule: (containerName: string, moduleName: string) => React.LazyExoticComponent<React.ComponentType<any>> | null;
};
export default _default;
