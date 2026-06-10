export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Log error stack trace to terminal
  console.error(`[Express Error] Status ${statusCode}: ${message}`);
  if (err.stack) {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
};
