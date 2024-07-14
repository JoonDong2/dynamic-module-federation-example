import { Platform } from 'react-native';
import Config from 'react-native-config';
import { getLocalhost } from './localhost';

const getDevContainers = () => ({
  entry: `http://${getLocalhost()}:9000/[name][ext]`,
  app1: `http://${getLocalhost()}:9001/[name][ext]`,
  app2: `http://${getLocalhost()}:9002/[name][ext]`,
});

const SERVER_URI = `http://${getLocalhost()}:4000/`;
const CONTAINER_SERVER_URI = SERVER_URI + 'container';
const CONTAINERS_SERVER_URI = SERVER_URI + 'containers';

export const fetchContainers = async (): Promise<any> => {
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
    Object.entries(await res.json()).map(([containerName, version]) => {
      return [
        containerName,
        `http://${getLocalhost()}:4000/${Config.NATIVE_VERSION}/${Platform.OS}/${Config.ENV}/${containerName}/${version}/[name][ext]`,
      ];
    })
  );
  return containers;
};

export const fetchContainer = async (containerName: string): Promise<any> => {
  if (Config.ENV === 'development') {
    return getDevContainers();
  }

  const params: any = {
    env: Config.ENV,
    os: Platform.OS,
    native_version: Config.NATIVE_VERSION,
  };
  const queryString = new URLSearchParams(params).toString();

  const res = await fetch(
    `${CONTAINER_SERVER_URI}/${containerName}?${queryString}`
  );

  const container = await res.json();

  const path = container[containerName];

  if (!path || typeof path !== 'string') {
    throw new Error('fetchContainer error');
  }

  return {
    [containerName]: `http://${getLocalhost()}:4000/${Config.NATIVE_VERSION}/${Platform.OS}/${Config.ENV}/${containerName}/${container[containerName]}/[name][ext]`,
  };
};

export class ErrorManager {
  static MAX_FAILURE_COUNT = 2;

  countOf: {
    [containerName: string]: number;
  } = {};

  manager: {
    refreshContainer: (
      containerName: string
    ) => undefined | void | boolean | Promise<boolean | undefined | void>;
  };

  constructor(manager: { refreshContainer: (containerName: string) => void }) {
    this.manager = manager;
  }

  async onError(error: any) {
    if (typeof error !== 'object' || !Object.hasOwn(error, 'containerName')) {
      return;
    }

    const key = `${error.containerName}@${error.uri}`;

    const count = this.countOf[key] ?? 0;

    if (count >= ErrorManager.MAX_FAILURE_COUNT) {
      return;
    }

    // 한 개의 container의 여러 개의 모듈에서 다발적으로 오류가 발생하는 경우, 복구 처리중엔 잠시 막아둔다.
    this.countOf[key] = Infinity;

    await this.manager.refreshContainer(error.containerName);
    this.countOf[key] = count + 1;
  }
}
