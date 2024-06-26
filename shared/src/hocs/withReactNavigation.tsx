import React from 'react';
import {
  NavigationContainer,
  type DocumentTitleOptions,
  type LinkingOptions,
  type NavigationContainerProps,
  type NavigationContainerRef,
  type Theme,
} from '@react-navigation/native';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface RootParamList {}
  }
}

type Props<ParamList extends {}> = NavigationContainerProps & {
  theme?: Theme;
  linking?: LinkingOptions<ParamList>;
  fallback?: React.ReactNode;
  documentTitle?: DocumentTitleOptions;
  onReady?: () => void;
};

function withReactNavigation<
  RootParamList extends {} = ReactNavigation.RootParamList,
>(
  props?: Props<RootParamList> & {
    ref?: React.Ref<NavigationContainerRef<RootParamList>>;
  }
) {
  return (Component: React.ReactElement) => (
    <NavigationContainer {...(props ?? {})}>{Component}</NavigationContainer>
  );
}

export default withReactNavigation;
