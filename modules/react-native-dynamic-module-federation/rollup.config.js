import peerDepsExternal from "rollup-plugin-peer-deps-external";
import resolve from "@rollup/plugin-node-resolve";
import image from "@rollup/plugin-image";
import babel from "@rollup/plugin-commonjs";
import typescript from "rollup-plugin-typescript2";
import commonjs from "@rollup/plugin-commonjs";

const packageJson = require("./package.json");
const extensions = ["js", "jsx", "ts", "tsx"];
const external = ["react", "react-dom", "styled-components"];

process.env.BABEL_ENV = "production";

export default {
  input: "./src/index.ts",
  output: [
    {
      file: packageJson.main,
      format: "cjs",
      sourcemap: "inline",
    },
    {
      file: packageJson.module,
      format: "esm",
      sourcemap: "inline",
    },
  ],
  plugins: [
    peerDepsExternal(),
    resolve({ extensions }),
    babel({
      extensions,
      include: ["packages/src/**/*"],
      exclude: /node_modules/,
      babelHelpers: "runtime",
    }),
    commonjs({
      include: /node_modules/,
    }),
    typescript({ useTsconfigDeclarationDir: true }),
  ],
  external,
};
