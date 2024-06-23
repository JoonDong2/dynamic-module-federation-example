'use strict';

var jsxRuntime = require('react/jsx-runtime');
var React = require('react');
var client = require('@callstack/repack/client');

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
    const containers = React.useRef(newContainers);
    React.useEffect(() => {
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
    return (jsxRuntime.jsx(Context.Provider, { value: { containers: newContainers }, children: children }));
};

const Null = () => null;
const useImportModule = (containerName, moduleName) => {
    const { containers } = React.useContext(Context);
    const version = containers[containerName];
    const prevVersion = React.useRef(version);
    const [Lazy, setLazy] = React.useState();
    React.useEffect(() => {
        setLazy((prev) => {
            if (version) {
                if (!prev || prevVersion.current !== version) {
                    prevVersion.current = version;
                    return React.lazy(() => client.Federated.importModule(containerName, moduleName));
                }
            }
            return prev;
        });
    }, [containerName, version]);
    // 익명 컴포넌트가 아니면 밖에서 컴포넌트 내용이 변경된 것을 인식하지 못한다.
    return (props) => {
        return Lazy ? jsxRuntime.jsx(Lazy, Object.assign({}, props)) : jsxRuntime.jsx(Null, {});
    };
};

exports.ImportModuleProvider = ImportModuleProvider;
exports.useImportModule = useImportModule;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbXSwic291cmNlc0NvbnRlbnQiOltdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzsifQ==
