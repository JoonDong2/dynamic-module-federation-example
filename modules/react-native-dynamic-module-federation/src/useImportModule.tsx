import React, {
  useContext,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";
import { Federated } from "@callstack/repack/client";
import { Context } from "./ImportModuleProvider";

export interface Containers {
  [name: string]: string; // name: version
}

const Null: React.FunctionComponent = () => null;

export const useImportModule = (
  containerName: string,
  moduleName: string
):
  | React.LazyExoticComponent<React.ComponentType<any>>
  | React.FunctionComponent<{}> => {
  const { containers } = useContext(Context);

  const version = containers[containerName];

  const prevVersion = useRef(version);
  const [Lazy, setLazy] =
    useState<React.LazyExoticComponent<React.ComponentType<any>>>();

  useEffect(() => {
    setLazy(
      (
        prev: React.LazyExoticComponent<React.ComponentType<any>> | undefined
      ) => {
        if (version) {
          if (!prev || prevVersion.current !== version) {
            prevVersion.current = version;
            return React.lazy(() =>
              Federated.importModule(containerName, moduleName)
            );
          }
        }
        return prev;
      }
    );
  }, [containerName, version]);

  // 익명 컴포넌트가 아니면 밖에서 컴포넌트 내용이 변경된 것을 인식하지 못한다.
  return (props: any) => {
    return Lazy ? <Lazy {...props} /> : <Null />;
  };
};

export default useImportModule;
