/**
 * Standardized API Response Utilities
 */

function successResponse(res, data = null, message = 'Success', statusCode = 200, pagination = null) {
  const payload = {
    success: true,
    message,
    data
  };

  if (pagination) {
    payload.pagination = pagination;
  }

  return res.status(statusCode).json(payload);
}

function errorResponse(res, message = 'An error occurred', statusCode = 500, errors = null) {
  const payload = {
    success: false,
    message,
    errors
  };

  return res.status(statusCode).json(payload);
}

module.exports = {
  successResponse,
  errorResponse
};
