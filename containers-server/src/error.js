export const handleError = (fn, options = {}) => {
  const { code = 500, catch: _catch, finally: _finally } = options;
  return async (req, res, next) => {
    try {
      const maybePromise = fn(req, res, next);
      if (maybePromise instanceof Promise) {
        await maybePromise;
      }
    } catch (e) {
      if (typeof _catch === "function") {
        _catch();
      }
      res.status(code).json({ error: e.message });
    } finally {
      if (typeof _finally === "function") {
        _finally();
      }
    }
  };
};

export default {
  handleError,
};
