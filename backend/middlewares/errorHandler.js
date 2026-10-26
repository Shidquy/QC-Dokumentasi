// backend/middlewares/errorHandler.js
import multer from 'multer';

export const errorHandler = (err, req, res, next) => {
  console.error('❌ Server Error:', err);

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ code: 413, error: 'File terlalu besar (maksimal 50MB)' });
    }
    return res.status(400).json({ code: 400, error: `Multer Error: ${err.message}` });
  }

  const statusCode = err.status || 500;
  res.status(statusCode).json({
    code: statusCode,
    error: err.message || 'Terjadi kesalahan internal server',
  });
};

