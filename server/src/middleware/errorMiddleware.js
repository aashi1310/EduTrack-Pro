const { errorResponse } = require('../utils/response');

function errorHandler(err, req, res, next) {
  console.error('[Global Error Handler]:', err);

  // MySQL Specific Error Handling
  if (err.code) {
    switch (err.code) {
      case 'ER_DUP_ENTRY':
        return errorResponse(res, 'Duplicate entry violation: This record or unique identifier already exists.', 409, {
          sqlMessage: err.sqlMessage
        });
      case 'ER_NO_REFERENCED_ROW_2':
      case 'ER_ROW_IS_REFERENCED_2':
        return errorResponse(res, 'Foreign key referential integrity violation.', 400, {
          sqlMessage: err.sqlMessage
        });
      case 'ER_SIGNAL_EXCEPTION':
        return errorResponse(res, err.sqlMessage || 'Integrity check trigger error', 400);
      case 'ER_CHECK_CONSTRAINT_VIOLATED':
        return errorResponse(res, 'Database check constraint violation.', 400, {
          sqlMessage: err.sqlMessage
        });
      case 'ECONNREFUSED':
        return errorResponse(res, 'Database connection refused.', 503);
    }
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  return errorResponse(res, message, statusCode, process.env.NODE_ENV === 'development' ? err.stack : null);
}

function notFoundHandler(req, res) {
  return errorResponse(res, `API route not found: ${req.method} ${req.originalUrl}`, 404);
}

module.exports = {
  errorHandler,
  notFoundHandler
};
