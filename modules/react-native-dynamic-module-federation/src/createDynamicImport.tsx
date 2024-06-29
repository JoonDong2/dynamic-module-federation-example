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
