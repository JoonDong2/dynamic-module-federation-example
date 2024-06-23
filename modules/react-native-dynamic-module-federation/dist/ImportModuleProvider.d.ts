import React, { PropsWithChildren } from "react";
export declare const Context: React.Context<ContextProps>;
export interface Containers {
    [name: string]: string;
}
declare global {
    var disposeContainer: undefined | {
        [containerName: string]: undefined | (() => void);
    };
}
export interface ContextProps {
    containers: Containers;
}
export declare const ImportModuleProvider: ({ children, containers: newContainers, }: PropsWithChildren<ContextProps>) => import("react/jsx-runtime").JSX.Element;
export default ImportModuleProvider;
