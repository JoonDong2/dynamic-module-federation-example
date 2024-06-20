export const handleError = (fn, code = 500) => {
  return async (req, res, next) => {
    try {
      const maybePromise = fn(req, res, next);
      if (maybePromise instanceof Promise) {
        await maybePromise;
      }
    } catch (e) {
      res.status(code).json({ error: e.message });
    }
  };
};

export default {
  handleError,
};
