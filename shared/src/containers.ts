import { Platform } from 'react-native';
import Config from 'react-native-config';
import { getLocalhost } from './localhost';
import type { Containers } from 'react-native-dynamic-module-federation';

export const getDevContainers = () => ({
  entry: `http://${getLocalhost()}:9000/[name][ext]`,
  app1: `http://${getLocalhost()}:9001/[name][ext]`,
  app2: `http://${getLocalhost()}:9002/[name][ext]`,
});

const CONTAINERS_SERVER_URI = `http://${getLocalhost()}:4000/containers`;

export const fetchContainers = async (): Promise<Containers> => {
  if (Config.ENV === 'development') {
    return getDevContainers();
  }

  const params: any = {
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
        `http://${getLocalhost()}:4000/${path}/[name][ext]`,
      ];
    })
  );
  return containers;
};
