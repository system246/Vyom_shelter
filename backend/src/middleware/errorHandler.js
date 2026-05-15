export const errorHandler = (err, req, res, next) => {
  console.error('❌', err.message);
  if (err.code === 'LIMIT_FILE_SIZE')
    return res.status(400).json({ success: false, message: `File too large. Max ${process.env.MAX_FILE_SIZE_MB || 5}MB.` });
  if (err.name === 'ValidationError')
    return res.status(400).json({ success: false, message: Object.values(err.errors).map(e => e.message).join(', ') });
  if (err.code === 11000)
    return res.status(409).json({ success: false, message: 'Duplicate entry.' });
  res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
};
