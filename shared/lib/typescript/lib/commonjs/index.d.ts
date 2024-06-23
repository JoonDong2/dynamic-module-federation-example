export const __esModule: boolean;
export const fetchContainers: () => Promise<{
    entry: string;
    app1: string;
    app2: string;
} | {
    [k: string]: string;
}>;
export const generateResolver: (containers: any) => (scriptId: any, caller: any) => {
    url: string | ((webpackContext: import("@callstack/repack/client").WebpackContext) => string);
    cache: boolean;
    query: {
        platform: "ios" | "android" | "windows" | "macos" | "web";
    };
    verifyScriptSignature: string;
} | undefined;
export const getDevContainers: () => {
    entry: string;
    app1: string;
    app2: string;
};
export const getLocalhost: () => "10.0.2.2" | "localhost";
export const useForeground: any;
//# sourceMappingURL=index.d.ts.map