/**
 * Strips MongoDB query-operator keys ($ne, $gt, $where, etc.) and dotted
 * keys from req.body/req.query/req.params, recursively. This is a safety
 * net in addition to the explicit string-type checks in controllers — if
 * a future route forgets to validate a body field before using it in a
 * query, this stops the classic NoSQL-injection pattern
 * ({ "email": { "$ne": null } }) from ever reaching Mongoose.
 */
const isPlainObject = (val) => val !== null && typeof val === 'object' && !Array.isArray(val);

const cleanInPlace = (obj) => {
  if (!isPlainObject(obj)) return;
  for (const key of Object.keys(obj)) {
    if (key.startsWith('$') || key.includes('.')) { delete obj[key]; continue; }
    const val = obj[key];
    if (Array.isArray(val)) val.forEach(cleanInPlace);
    else if (isPlainObject(val)) cleanInPlace(val);
  }
};

export const sanitizeInput = (req, res, next) => {
  cleanInPlace(req.body);
  cleanInPlace(req.query);
  cleanInPlace(req.params);
  next();
};
