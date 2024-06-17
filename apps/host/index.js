/**
 * @format
 */

import {ScriptManager, Script, Federated} from '@callstack/repack/client';
import {AppRegistry, Platform} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import {getLocalhost} from '../../shared/localhost.js';

ScriptManager.shared.addResolver(async (scriptId, caller) => {
  const resolveURL = Federated.createURLResolver({
    containers: {
      entry: `http://${getLocalhost(Platform.OS)}:9000/[name][ext]`,
    },
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
});

AppRegistry.registerComponent(appName, () => App);
