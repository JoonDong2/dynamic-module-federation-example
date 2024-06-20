const Template = require("webpack/lib/Template");
const RuntimeGlobals = require("webpack/lib/RuntimeGlobals");

const PLUGIN_NAME = "ReactDynamicModuleFederationPlugin";

const DISPOSE_CONTAINER_KEY = "disposeContainer";

class ReactDynamicModuleFederationPlugin {
  constructor(options) {
    this.options = options;
  }

  apply(compiler) {
    compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: PLUGIN_NAME,
          stage: compilation.PROCESS_ASSETS_STAGE_ADDITIONS,
        },
        (assets) => {
          for (const assetName in assets) {
            const isContainer = assetName.endsWith(".container.bundle");
            if (!isContainer) {
              continue;
            }

            const containerName = assetName.split(".")[0];

            const asset = assets[assetName];

            const children = asset.getChildren();

            const sources = children[1]._source._children;
            const length = sources.length;
            let iifeEndIndex = -1;
            for (let i = length - 1; i >= 0; i--) {
              const source = sources[i];
              if (typeof source === "string" && source.includes("})()")) {
                iifeEndIndex = i;
                break;
              }
            }

            if (iifeEndIndex !== -1) {
              const insertDisposeContainer = Template.indent([
                `if (!${RuntimeGlobals.hasOwnProperty}(${RuntimeGlobals.global}, "${DISPOSE_CONTAINER_KEY}")) {`,
                `${RuntimeGlobals.global}["${DISPOSE_CONTAINER_KEY}"] = {}`,
                "}",
                `${RuntimeGlobals.global}.${DISPOSE_CONTAINER_KEY}['${containerName}'] = function() {`,
                `var webpackChunkKey = "webpackChunk${containerName}";`,
                "if (Array.isArray(self[webpackChunkKey]) && self[webpackChunkKey].length > 0) {",
                "self[webpackChunkKey] = [];",
                "}",
                `if (${RuntimeGlobals.hasOwnProperty}(${RuntimeGlobals.global}, "${containerName}")) {`,
                `delete ${RuntimeGlobals.global}.${containerName};`,
                `}`,
                "}\n",
              ]);

              children[1]._source._children = [
                ...sources.slice(0, iifeEndIndex),
                `!function() { ${insertDisposeContainer}}()\n`,
                ...sources.slice(iifeEndIndex, length),
              ];
            }
          }
        }
      );
    });
  }
}

module.exports = ReactDynamicModuleFederationPlugin;
