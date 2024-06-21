const ModuleFactory = require("webpack/lib/ModuleFactory");
const ReactDynamicModuleFederationModule = require("./ReactDynamicModuleFederationModule");

module.exports = class JoondongFactory extends ModuleFactory {
  create({ dependencies: [dependency] }, callback) {
    callback(null, {
      module: new ReactDynamicModuleFederationModule(dependency.name),
    });
  }
};
