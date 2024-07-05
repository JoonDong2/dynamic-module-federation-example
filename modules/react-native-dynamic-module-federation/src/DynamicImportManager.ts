import type { ErrorInfo } from 'react';
import type { Containers } from './DynamicImportProvider';

interface Options {
  fetchContainers: () => Containers | Promise<Containers>;
  fetchContainer?: (containerName: string) => Containers | Promise<Containers>;
  onError?: (error: Error, info?: ErrorInfo) => void;
  deleteCacheFilesWhenRefresh?: boolean;
}

interface Setters {
  setRefreshContainers: (refreshContainers: () => void) => void;
  setRefreshContainer: (
    refreshContainer: (containerName: string) => void
  ) => void;
}

export const OptionsSymbol = Symbol('DynamicImportManagerOptions');
export const SettersSymbol = Symbol('DynamicImportManagerSetters');

const dummyFunction = () => {};

class DynamicImportManager {
  refreshContainers: () => void = dummyFunction;

  refreshContainer: (containerName: string) => void = dummyFunction;

  private [OptionsSymbol]: Options;

  private [SettersSymbol]: Setters = {
    setRefreshContainers: (refreshContainers) => {
      this.refreshContainers = refreshContainers;
    },
    setRefreshContainer: (refreshContainer) => {
      this.refreshContainer = refreshContainer;
    },
  };

  constructor(options: Options) {
    this[OptionsSymbol] = options;
  }
}

export default DynamicImportManager;
