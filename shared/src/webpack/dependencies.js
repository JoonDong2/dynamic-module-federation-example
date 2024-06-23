const dependencies = require('./dependencies.json');

const getSharedDependencies = ({ eager = true }) => {
  const shared = Object.entries(dependencies).map(([dependency, version]) => {
    return [dependency, { singleton: true, eager, requiredVersion: version }];
  });

  return Object.fromEntries(shared);
};

module.exports = {
  getSharedDependencies,
};
