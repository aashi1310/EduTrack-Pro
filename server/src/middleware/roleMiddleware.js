const { errorResponse } = require('../utils/response');

/**
 * Role-Based Authorization Guard Middleware
 * @param  {...string} allowedRoles Allowed role names (e.g. 'ADMIN', 'FACULTY', 'STUDENT')
 */
function roleGuard(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Unauthenticated user', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return errorResponse(
        res,
        `Forbidden: Role '${req.user.role}' lacks authorization for this endpoint. Required: [${allowedRoles.join(', ')}]`,
        403
      );
    }

    next();
  };
}

module.exports = {
  roleGuard
};
