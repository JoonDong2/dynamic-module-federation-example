import type { Containers } from './DynamicImportProvider';

const getSymetricDifference = (a: Containers = {}, b: Containers = {}) => {
  const result = new Set<string>();

  Object.entries(a).forEach(([containerName, version]) => {
    if (b?.[containerName] !== version) {
      result.add(containerName);
    }
  });

  Object.entries(b).forEach(([containerName, version]) => {
    if (a?.[containerName] !== version) {
      result.add(containerName);
    }
  });

  return [...result];
};

export default getSymetricDifference;
