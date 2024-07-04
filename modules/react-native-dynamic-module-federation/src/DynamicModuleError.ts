class DynamicModuleError extends Error {
  containerName: string;

  moduleName: string;

  origin?: Error;

  constructor(containerName: string, moduleName: string, origin?: Error) {
    const stringifedOrigin = origin
      ? {
          name: origin.name,
          message: origin.message,
          stack: origin.stack,
        }
      : undefined;

    super(
      `Dynamic Module Timeout: ${JSON.stringify({ containerName, moduleName, origin: stringifedOrigin })}`
    );

    this.containerName = containerName;
    this.moduleName = moduleName;
    this.origin = origin;
  }
}

export default DynamicModuleError;
