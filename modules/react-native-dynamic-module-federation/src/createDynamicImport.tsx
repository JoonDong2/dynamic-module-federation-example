import React, { useRef, type PropsWithChildren } from 'react';
import DynamicImportProvider, {
  type Props,
  type DynamicImportProviderHandle,
} from './DynamicImportProvider';

export interface DynamicImport {
  Provider: (props: PropsWithChildren<Partial<Props>>) => React.JSX.Element;
  refresh: () => void;
}

const dummyFunction = () => {};

const createDynamicImport = (defaultProps: Props): DynamicImport => {
  const DynamicImport: DynamicImport = {
    Provider: ({ children }) => <>{children}</>,
    refresh: dummyFunction,
  };

  const Provider = ({
    children,
    ...props
  }: PropsWithChildren<Partial<Props>>) => {
    const ref = useRef<DynamicImportProviderHandle>(null);
    DynamicImport.refresh = () => {
      ref.current?.refresh();
    };

    // DynamicImport.Provider는 DynamicImportProvider와 달리, 외부에서 컨트롤할 것이기 때문에 ref를 막는다.
    return (
      <DynamicImportProvider {...defaultProps} {...props} ref={ref}>
        {children}
      </DynamicImportProvider>
    );
  };
  DynamicImport.Provider = Provider;

  return DynamicImport;
};

export default createDynamicImport;
