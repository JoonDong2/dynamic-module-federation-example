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
    console.log("/containers");
    const query = req.query;
    const groupPath = PATH_FOR_GROUPING.map((key) => query[key]).join("/");
    const remotesPath = `${DEPLOYMENTS_PATH}/${groupPath}`;
    const remotes = await fs.getFolders(remotesPath);
    const resolvers = Object.fromEntries(
      await Promise.all(
        remotes.map(async (remote) => {
          const maxVersion = version.max(
            await fs.getFolders(`${remotesPath}/${remote}`)
          );
          return [remote, `${groupPath}/${remote}/${maxVersion}`];
        })
      )
    );
    res.json(resolvers);
  })
);

app.post(
  "/deployment",
  upload.single("archive"),
  ...validateDeployment(),
  handleError(
    async (req, res) => {
      console.log("deployment");
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
    },
    {
      finally: () => {
        fs.remove(`./uploads`);
      },
    }
  )
);

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
