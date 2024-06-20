import { getLocalhost } from "./localhost.js";

export const getDevContainers = (os) => ({
  entry: `http://${getLocalhost(os)}:9000/[name][ext]`,
  app1: `http://${getLocalhost(os)}:9001/[name][ext]`,
  app2: `http://${getLocalhost(os)}:9002/[name][ext]`,
});
