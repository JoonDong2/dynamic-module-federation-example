import { Federated, Script } from '@callstack/repack/client';
import { Platform } from 'react-native';
import { type Containers } from './DynamicImportProvider';

export const generateResolver = (containers: Containers): any => {
  return (scriptId: string, caller?: string) => {
    const resolveURL = Federated.createURLResolver({
      containers,
    });

    let url;
    if (__DEV__ && caller === 'main') {
      url = Script.getDevServerURL(scriptId);
    } else {
      url = resolveURL(scriptId, caller);
    }

    if (!url) {
      return undefined;
    }

    return {
      url,
      cache: !__DEV__,
      query: {
        platform: Platform.OS, // only needed in development
      },
      verifyScriptSignature: 'off',
    };
  };
};
