import { compare } from "compare-versions";

export function max(versions) {
  if (!Array.isArray(versions) || versions.length === 0) {
    return undefined;
  }

  return versions.reduce((prev, current) => {
    if (!prev) return current;
    return compare(prev, current, ">") ? prev : current;
  }, undefined);
}

export default {
  max,
};
