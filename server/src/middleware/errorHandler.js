export function errorHandler(err, req, res, next) {
  console.error('❌ Server Error:', err.stack || err.message);

  const status = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    success: false,
    error: message,
    timestamp: new Date().toISOString()
  });
}
