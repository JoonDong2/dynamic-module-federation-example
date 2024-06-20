import {compare} from 'compare-versions';

export function max(versions) {
  return versions.reduce((prev, current) => {
    return compare(prev, current, '>') ? prev : current;
  }, '0.0.0');
}

export default {
  max,
};
