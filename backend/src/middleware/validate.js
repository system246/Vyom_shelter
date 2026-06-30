/**
 * Wraps a zod schema as Express middleware. On failure, throws a tagged
 * error that errorHandler.js turns into a consistent 422 response with
 * per-field messages — so every route gets the same error shape without
 * repeating try/catch validation logic everywhere.
 *
 * Usage: router.post('/signup', validate(signupSchema), signup)
 *
 * `source` defaults to 'body'; pass 'query' or 'params' for routes that
 * validate those instead (e.g. search filters).
 */
export const validate = (schema, source = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      field: issue.path.join('.') || source,
      message: issue.message,
    }));
    const err = new Error('Validation failed');
    err.name = 'AppValidationError';
    err.errors = errors;
    return next(err);
  }
  // Replace with the parsed (and coerced/defaulted) data so controllers
  // get clean, typed values instead of raw request input.
  req[source] = result.data;
  next();
};
