export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
}

export function errorHandler(err, req, res, _next) {
  const status = err.statusCode || err.status || 500;
  if (status >= 500) {
    console.error("[EatUp Server Error]", err);
  }
  res.status(status).json({
    success: false,
    message: err.message || "Internal server error"
  });
}
