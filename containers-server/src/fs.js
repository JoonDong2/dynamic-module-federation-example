import fs from "fs";
import path from "path";
import unzipper from "unzipper";

export async function exists(accessPath) {
  try {
    await fs.promises.access(accessPath);
    return true;
  } catch (e) {
    return false;
  }
}

function lstat(p) {
  return new Promise((resolve, reject) => {
    fs.lstat(p, (error, stats) => {
      if (error) {
        return reject(error);
      }
      resolve(stats);
    });
  });
}

export async function remove(p) {
  if (!(await exists(p))) {
    return;
  }

  const stats = await lstat(p);

  if (stats.isDirectory()) {
    for (const file of await fs.promises.readdir(p)) {
      await remove(path.join(p, file));
    }
    await fs.promises.rmdir(p);
  } else {
    await fs.promises.unlink(p);
  }
}

export async function unzip(zipPath, outputPath) {
  const directory = await unzipper.Open.file(zipPath);
  await directory.extract({ path: outputPath });
}

// 특정 경로에 있는 폴더 리스트를 얻는 함수
function getFolders(directoryPath) {
  return new Promise((resolve, reject) => {
    fs.readdir(directoryPath, (error, files) => {
      if (error) {
        return resolve([]);
      }

      let folders = [];
      let length = files.length;

      if (length) {
        files.forEach((file) => {
          const filePath = path.join(directoryPath, file);
          fs.lstat(filePath, (error, stats) => {
            if (error) {
              return reject(error);
            }

            if (stats.isDirectory()) {
              folders.push(file);
            }

            if (!--length) {
              resolve(folders);
            }
          });
        });
      } else {
        resolve([]);
      }
    });
  });
}

export default {
  exists,
  remove,
  unzip,
  getFolders,
};
