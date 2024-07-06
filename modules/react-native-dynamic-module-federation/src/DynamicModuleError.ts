class DynamicModuleError extends Error {
  containerName: string;

  origin?: Error;

  uri?: string;

  constructor(containerName: string, uri?: string, origin?: Error) {
    const stringifedOrigin = origin
      ? {
          name: origin.name,
          message: origin.message,
          stack: origin.stack,
        }
      : undefined;

    super(
      `Dynamic Module Timeout: ${JSON.stringify({ containerName, origin: stringifedOrigin })}`
    );

    this.containerName = containerName;
    this.origin = origin;
    this.uri = uri;
  }
}

export default DynamicModuleError;
