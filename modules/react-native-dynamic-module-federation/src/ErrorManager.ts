import type { ErrorInfo } from 'react';
import type DynamicImportManager from './DynamicImportManager';

export interface ErrorManager {
  new (dynamicImportManager: DynamicImportManager): ErrorManagerInstance;
}

export interface ErrorManagerInstance {
  onError(error: Error, info?: ErrorInfo): void;
}
