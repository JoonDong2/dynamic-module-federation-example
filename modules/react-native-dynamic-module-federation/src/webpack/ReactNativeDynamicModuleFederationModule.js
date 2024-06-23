const Module = require("webpack/lib/Module");
const RuntimeGlobals = require("webpack/lib/RuntimeGlobals");
const {
  JAVASCRIPT_MODULE_TYPE_DYNAMIC,
} = require("webpack/lib/ModuleTypeConstants");
const { RawSource } = require("webpack-sources");
const Template = require("webpack/lib/Template");

const SOURCE_TYPES = new Set(["javascript"]);

const DISPOSE_CONTAINER_KEY = "disposeContainer";

module.exports = class ReactNativeDynamicModuleFederationModule extends Module {
  constructor(name) {
    super(JAVASCRIPT_MODULE_TYPE_DYNAMIC, null);
    this.name = name;
  }

  getSourceTypes() {
    return SOURCE_TYPES;
  }

  identifier() {
    return `container entry dynamic module federation`;
  }

  readableIdentifier(requestShortener) {
    return `container entry`;
  }

  libIdent(options) {
    return `${this.layer ? `(${this.layer})/` : ""}webpack/container/entry/${
      this.name
    }`;
  }

  needBuild(context, callback) {
    return callback(null, !this.buildMeta);
  }

  build(options, compilation, resolver, fs, callback) {
    this.buildMeta = {};
    this.buildInfo = {
      strict: true,
    };

    this.buildMeta.exportsType = "namespace";

    callback();
  }

  codeGeneration({ moduleGraph, chunkGraph, runtimeTemplate }) {
    const sources = new Map();

    const runtimeRequirements = new Set([
      RuntimeGlobals.definePropertyGetters,
      RuntimeGlobals.hasOwnProperty,
      RuntimeGlobals.global,
    ]);

    const source = Template.indent([
      `if (!${RuntimeGlobals.hasOwnProperty}(${RuntimeGlobals.global}, "${DISPOSE_CONTAINER_KEY}")) {`,
      Template.indent([
        `${RuntimeGlobals.global}["${DISPOSE_CONTAINER_KEY}"] = {}`,
      ]),
      "}",
      `${RuntimeGlobals.global}.${DISPOSE_CONTAINER_KEY}['${this.name}'] = function() {`,
      Template.indent([
        `var webpackChunkKey = "webpackChunk${this.name}";`,
        "if (Array.isArray(self[webpackChunkKey]) && self[webpackChunkKey].length > 0) {",
        Template.indent(["self[webpackChunkKey] = [];"]),
        "}",
        `if (${RuntimeGlobals.hasOwnProperty}(${RuntimeGlobals.global}, "${this.name}")) {`,
        Template.indent([`delete ${RuntimeGlobals.global}.${this.name};`]),
        `}`,
      ]),
      "}\n",
    ]);

    sources.set("javascript", new RawSource(source));

    return {
      sources,
      runtimeRequirements,
    };
  }

  size(type) {
    return 1;
  }
};
