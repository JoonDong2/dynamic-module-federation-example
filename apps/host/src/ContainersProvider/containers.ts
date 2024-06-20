import {Platform} from 'react-native';
import {getLocalhost} from '../../../../shared/localhost';
import {type Containers} from 'react-native-dynamic-module-federation';
import Config from 'react-native-config';
import {getDevContainers} from '../../../../shared/containers.js';

const CONTAINERS_SERVER_URI = `http://${getLocalhost(
  Platform.OS,
)}:4000/containers`;

export const fetchContainers = async (): Promise<Containers> => {
  if (Config.ENV === 'development') {
    return getDevContainers(Platform.OS);
  }

  const params = {
    env: Config.ENV,
    os: Platform.OS,
    native_version: Config.NATIVE_VERSION,
  };
  const queryString = new URLSearchParams(params).toString();

  const res = await fetch(`${CONTAINERS_SERVER_URI}?${queryString}`);
  const containers = Object.fromEntries(
    Object.entries(await res.json()).map(([containerName, path]) => {
      return [
        containerName,
        `http://${getLocalhost(Platform.OS)}:4000/${path}/[name][ext]`,
      ];
    }),
  );
  return containers;
};
