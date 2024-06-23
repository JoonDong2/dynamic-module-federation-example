export function getDevContainers(): {
    entry: string;
    app1: string;
    app2: string;
};
export function fetchContainers(): Promise<{
    [k: string]: string;
} | {
    entry: string;
    app1: string;
    app2: string;
}>;
//# sourceMappingURL=containers.d.ts.map