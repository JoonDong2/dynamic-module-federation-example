import { handleError } from "../error.js";
import { PATH_FOR_GROUPING } from "../constants.js";

export const validateQueryParams = handleError((req, _, next) => {
  const queryParams = req.query;

  if (
    !queryParams ||
    typeof queryParams !== "object" ||
    Object.keys(queryParams).length === 0
  ) {
    throw new Error("파라미터가 없습니다.");
  }

  const emptyKeys = PATH_FOR_GROUPING.filter((key) => !queryParams[key]);

  if (emptyKeys.length !== 0) {
    throw new Error(`${emptyKeys.join(", ")} 값이 유효하지 않습니다.`);
  }

  next();
}, 400);

export default () => [validateQueryParams];
