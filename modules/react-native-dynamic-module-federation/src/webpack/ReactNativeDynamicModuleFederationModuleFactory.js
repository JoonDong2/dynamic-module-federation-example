const ModuleFactory = require("webpack/lib/ModuleFactory");
const ReactNativeDynamicModuleFederationModule = require("./ReactNativeDynamicModuleFederationModule");

module.exports = class ReactNativeDynamicModuleFederationModuleFactory extends (
  ModuleFactory
) {
  create({ dependencies: [dependency] }, callback) {
    callback(null, {
      module: new ReactNativeDynamicModuleFederationModule(dependency.name),
    });
  }
};
