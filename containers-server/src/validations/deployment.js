import fs from "../fs.js";
import { handleError } from "../error.js";
import { DEPLOYMENTS_PATH, DEPLOYMENT_PATH_LIST } from "../constants.js";

// 배포 압축 파일 포함 여부 검사
const validateIncludingFile = handleError((req, _, next) => {
  if (!req.file) {
    throw new Error("배포 파일이 존재하지 않습니다.");
  }

  next();
}, 400);

// body 유효성 검사
const validateBody = handleError((req, _, next) => {
  const body = req.body;

  if (!body || typeof body !== "object" || Object.keys(body).length === 0) {
    throw new Error("body가 없습니다.");
  }

  const emptyKeys = DEPLOYMENT_PATH_LIST.filter((key) => !body[key]);

  if (emptyKeys.length !== 0) {
    throw new Error(`${emptyKeys.join(", ")} 값이 유효하지 않습니다.`);
  }

  next();
}, 400);

// 배포 존재 여부 확인
const validateAlreadyDeployment = handleError(async (req, _, next) => {
  const body = req.body || {};

  const exists = await fs.exists(
    `${DEPLOYMENTS_PATH}/${DEPLOYMENT_PATH_LIST.map((key) => body[key]).join(
      "/"
    )}`
  );

  if (exists) {
    throw new Error(
      `이미 ${JSON.stringify(
        body
      )} 앱이 배포되어 있습니다. 다른 버전을 배포해 주세요.`
    );
  }

  next();
}, 400);

const versionPattern = /^\d+\.\d+\.\d+$/;

const validateVersion = handleError((req, _, next) => {
  const version = req.body["version"];

  if (!versionPattern.test(version)) {
    throw new Error("버전 형태가 세 자리 버전이 아닙니다.");
  }

  next();
}, 400);

function isValidVersionString(version) {
  // 정규 표현식 패턴
  const pattern = /^\d+\.\d+\.\d+$/;
  // 문자열과 패턴을 비교하여 일치 여부 반환
  return pattern.test(version);
}

export default () => [
  validateIncludingFile,
  validateBody,
  validateAlreadyDeployment,
  validateVersion,
];
