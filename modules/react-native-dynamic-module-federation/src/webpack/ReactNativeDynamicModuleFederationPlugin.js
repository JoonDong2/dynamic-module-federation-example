const ContainerEntryDependency = require("webpack/lib/container/ContainerEntryDependency");
const ContainerExposedDependency = require("webpack/lib/container/ContainerExposedDependency");
const ReactNativeDynamicModuleFederationModuleFactory = require("./ReactNativeDynamicModuleFederationModuleFactory");

const PLUGIN_NAME = "ReactDynamicModuleFederationPlugin";

class ReactNativeDynamicModuleFederationPlugin {
  constructor(options) {
    this.options = options;
  }

  apply(compiler) {
    const { name } = this.options;
    compiler.hooks.make.tapAsync(PLUGIN_NAME, (compilation, callback) => {
      const dep = new ContainerEntryDependency(name);
      dep.loc = { name };
      compilation.addEntry(compilation.options.context, dep, {}, (error) => {
        if (error) return callback(error);
        callback();
      });
    });

    compiler.hooks.thisCompilation.tap(
      PLUGIN_NAME,
      (compilation, { normalModuleFactory }) => {
        compilation.dependencyFactories.set(
          ContainerEntryDependency,
          new ReactNativeDynamicModuleFederationModuleFactory()
        );
        compilation.dependencyFactories.set(
          ContainerExposedDependency,
          normalModuleFactory
        );
      }
    );
  }
}

module.exports = ReactNativeDynamicModuleFederationPlugin;
