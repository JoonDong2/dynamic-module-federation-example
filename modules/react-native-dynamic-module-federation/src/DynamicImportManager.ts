import type { Containers } from './DynamicImportProvider';
import type { ErrorManager, ErrorManagerInstance } from './ErrorManager';

type RefreshContainers = () =>
  | undefined
  | boolean
  | void
  | Promise<undefined | boolean | void>;

type RefreshContainer = (
  containerName: string
) => undefined | boolean | void | Promise<undefined | boolean | void>;

interface Options {
  fetchContainers: () => Containers | Promise<Containers>;
  fetchContainer?: (containerName: string) => Containers | Promise<Containers>;
  errorManager?: ErrorManager;
  deleteCacheFilesWhenRefresh?: boolean;
}

interface Setters {
  setRefreshContainers: (refreshContainers: RefreshContainers) => void;
  setRefreshContainer: (refreshContainer: RefreshContainer) => void;
}

// 외부에 속성을 노출하지 않고, 내부 다른 모듈에서 사용하기 위해 심볼 사용
export const OptionsSymbol = Symbol('DynamicImportManagerOptions');
export const SettersSymbol = Symbol('DynamicImportManagerSetters');
export const ErrorManagerSymbol = Symbol('DynamicImportErrorManager');

const dummyFunction = () => {};

class DynamicImportManager {
  refreshContainers: RefreshContainers = dummyFunction;

  refreshContainer: RefreshContainer = dummyFunction;

  private [OptionsSymbol]: Options;

  private [SettersSymbol]: Setters = {
    setRefreshContainers: (refreshContainers) => {
      this.refreshContainers = refreshContainers;
    },
    setRefreshContainer: (refreshContainer) => {
      this.refreshContainer = refreshContainer;
    },
  };

  private [ErrorManagerSymbol]?: ErrorManagerInstance;

  constructor(options: Options) {
    this[OptionsSymbol] = options;
    if (options.errorManager) {
      this[ErrorManagerSymbol] = new options.errorManager(this);
    }
  }
}

export default DynamicImportManager;
