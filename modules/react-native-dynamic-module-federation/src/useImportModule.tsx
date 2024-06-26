import React, { useContext, useEffect, useRef, useState } from "react";
import { Federated } from "@callstack/repack/client";
import { Context } from "./ImportModuleProvider";

export interface Containers {
  [name: string]: string; // name: uri
}

const Null = () => null;

export function useImportModule<P = any>(
  containerName: string,
  moduleName: string
): (props: P) => JSX.Element | null {
  const { containers } = useContext(Context);

  const uri = useRef(containers[containerName]);

  const [Lazy, setLazy] = useState<(props: any) => JSX.Element>();

  useEffect(() => {
    setLazy((prev?: (props: P) => JSX.Element) => {
      const newUri = containers[containerName];
      if (uri) {
        if (!prev || uri.current !== newUri) {
          uri.current = newUri;
          // 익명 컴포넌트가 아니면 밖에서 컴포넌트 내용이 변경된 것을 인식하지 못한다.
          const NewLazy = React.lazy(() =>
            Federated.importModule(containerName, moduleName)
          );

          return (props: P) => <NewLazy {...props} />;
        }
      }
      return prev;
    });
  }, [containers, containerName, uri]);

  return Lazy ?? Null;
}

export default useImportModule;