import express from "express";
import cors from "cors";
import multer from "multer";
import validateDeployment from "./src/validations/deployment.js";
import validateContainers from "./src/validations/containers.js";
import { handleError } from "./src/error.js";
import { unzip, remove } from "./src/fs.js";
import {
  DEPLOYMENTS_PATH,
  DEPLOYMENT_PATH_LIST,
  PATH_FOR_GROUPING,
} from "./src/constants.js";
import fs from "./src/fs.js";
import version from "./src/version.js";

const app = express();
const PORT = 4000;
const upload = multer({ dest: "uploads/" });
app.use(
  "/",
  (req, res, next) => {
    console.log(req.url, req.params);
    next();
  },
  express.static("deployments")
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

app.get(
  "/containers",
  ...validateContainers(),
  handleError(async (req, res) => {
    const query = req.query;
    const groupPath = PATH_FOR_GROUPING.map((key) => query[key]).join("/");
    const containersPath = `${DEPLOYMENTS_PATH}/${groupPath}`;
    const containers = await fs.getFolders(containersPath);

    const resolvers = Object.fromEntries(
      (
        await Promise.all(
          containers.map(async (remote) => {
            const versions = await fs.getFolders(`${containersPath}/${remote}`);
            const maxVersion = version.max(versions);
            if (!maxVersion) return undefined;
            return [remote, maxVersion];
          })
        )
      ).filter((entry) => !!entry)
    );
    res.json(resolvers);
  })
);

app.post(
  "/deployment",
  upload.single("archive"),
  ...validateDeployment(),
  handleError(async (req, res) => {
    const body = req.body;
    const deployPath = `${DEPLOYMENTS_PATH}/${DEPLOYMENT_PATH_LIST.map(
      (key) => body[key]
    ).join("/")}`;
    const error = await unzip(req.file.path, deployPath).catch((reason) => {
      return true;
    });
    if (error) {
      remove(deployPath);
      throw new Error("배포 파일 압축 해제 실패");
    }
    res.sendStatus(201);
  })
);

app.get(
  "/container/:name",
  ...validateContainers(),
  handleError(async (req, res) => {
    const query = req.query;
    const containerName = req.params.name;
    const groupPath = PATH_FOR_GROUPING.map((key) => query[key]).join("/");
    const containerPath = `${DEPLOYMENTS_PATH}/${groupPath}/${containerName}`;
    const versions = await fs.getFolders(containerPath);

    res.json({
      [containerName]: version.max(versions),
    });
  })
);

app.get("/status", (req, res) => {
  const key = req.query?.key;
  res.json({
    key,
  });
});

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
