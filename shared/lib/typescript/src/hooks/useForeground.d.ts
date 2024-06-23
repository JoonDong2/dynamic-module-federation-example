interface BackgroundCallback {
    (): undefined | void;
}
interface ForegroundCallback {
    (): void | undefined | BackgroundCallback | Promise<undefined | BackgroundCallback | void>;
}
declare const useForeground: (callback: ForegroundCallback) => void;
export default useForeground;
//# sourceMappingURL=useForeground.d.ts.map