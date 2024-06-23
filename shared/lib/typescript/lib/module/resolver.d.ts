export function generateResolver(containers: any): (scriptId: any, caller: any) => {
    url: string | ((webpackContext: import("@callstack/repack/client").WebpackContext) => string);
    cache: boolean;
    query: {
        platform: "ios" | "android" | "windows" | "macos" | "web";
    };
    verifyScriptSignature: string;
} | undefined;
//# sourceMappingURL=resolver.d.ts.map