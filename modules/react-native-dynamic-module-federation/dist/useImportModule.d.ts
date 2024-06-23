import React from "react";
export interface Containers {
    [name: string]: string;
}
export declare const useImportModule: (containerName: string, moduleName: string) => React.LazyExoticComponent<React.ComponentType<any>> | React.FunctionComponent<{}>;
export default useImportModule;
