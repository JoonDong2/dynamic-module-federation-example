const { Dependency } = require('webpack');
const ReactNativeDynamicModuleFederationModuleFactory = require('./ReactNativeDynamicModuleFederationModuleFactory');

const PLUGIN_NAME = 'ReactDynamicModuleFederationPlugin';

class ReactNativeDynamicModuleFederationDependency extends Dependency {
  constructor(name) {
    super();
    this.name = name;
  }
}

class ReactNativeDynamicModuleFederationPlugin {
  constructor(options) {
    this.options = options;
  }

  apply(compiler) {
    const { name } = this.options;
    compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
      compilation.dependencyFactories.set(
        ReactNativeDynamicModuleFederationDependency,
        new ReactNativeDynamicModuleFederationModuleFactory()
      );
    });

    compiler.hooks.make.tapAsync(PLUGIN_NAME, (compilation, callback) => {
      const dep = new ReactNativeDynamicModuleFederationDependency(name);
      dep.loc = { name };
      compilation.addEntry(
        compilation.options.context,
        dep,
        { filename: `${name}.container.bundle` },
        (error) => {
          if (error) return callback(error);
          callback();
        }
      );
    });
  }
}

module.exports = ReactNativeDynamicModuleFederationPlugin;
