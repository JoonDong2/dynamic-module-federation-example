import React, { type PropsWithChildren } from "react";
export interface Containers {
    [name: string]: string;
}
declare global {
    var disposeContainer: undefined | {
        [containerName: string]: undefined | (() => void);
    };
}
interface ContextProps {
    containers: Containers;
}
export declare const ImportModuleProvider: ({ children, containers: newContainers, }: PropsWithChildren<ContextProps>) => import("react/jsx-runtime").JSX.Element;
export declare const useImportModule: (containerName: string, moduleName: string) => React.LazyExoticComponent<React.ComponentType<any>> | null;
export {};
