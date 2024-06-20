import { jsx } from 'react/jsx-runtime';
import { Federated } from '@callstack/repack/client';
import React, { useRef, useEffect, useContext, useState } from 'react';

const Context = React.createContext({
    containers: {},
});
const getSymetricDifference = (a, b) => {
    const result = new Set();
    Object.entries(a).forEach(([containerName, version]) => {
        if ((b === null || b === void 0 ? void 0 : b[containerName]) !== version) {
            result.add(containerName);
        }
    });
    Object.entries(b).forEach(([containerName, version]) => {
        if ((a === null || a === void 0 ? void 0 : a[containerName]) !== version) {
            result.add(containerName);
        }
    });
    return [...result];
};
const ImportModuleProvider = ({ children, containers: newContainers, }) => {
    const containers = useRef(newContainers);
    useEffect(() => {
        try {
            const changedContainers = getSymetricDifference(containers.current, newContainers);
            changedContainers.forEach((containerName) => {
                var _a, _b;
                (_b = (_a = global.disposeContainer) === null || _a === void 0 ? void 0 : _a[containerName]) === null || _b === void 0 ? void 0 : _b.call(_a);
            });
            containers.current = newContainers;
        }
        catch (_a) { }
    }, [newContainers]);
    return (jsx(Context.Provider, { value: { containers: newContainers }, children: children }));
};
const Null = () => null;
const useImportModule = (containerName, moduleName) => {
    const { containers } = useContext(Context);
    const version = containers[containerName];
    const prevVersion = useRef(version);
    const [Lazy, setLazy] = useState();
    useEffect(() => {
        setLazy((prev) => {
            if (version) {
                if (!prev || prevVersion.current !== version) {
                    prevVersion.current = version;
                    return React.lazy(() => Federated.importModule(containerName, moduleName));
                }
            }
            return prev;
        });
    }, [containerName, version]);
    // 익명 컴포넌트가 아니면 밖에서 컴포넌트 내용이 변경된 것을 인식하지 못한다.
    return (props) => {
        return Lazy ? jsx(Lazy, Object.assign({}, props)) : jsx(Null, {});
    };
};

export { ImportModuleProvider, useImportModule };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguZXMuanMiLCJzb3VyY2VzIjpbXSwic291cmNlc0NvbnRlbnQiOltdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OyJ9
