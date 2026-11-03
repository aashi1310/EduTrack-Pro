const { query } = require('../../config/db');
const { successResponse, errorResponse } = require('../../utils/response');

async function getNotifications(req, res, next) {
  try {
    const userId = req.user.userId;

    const notifications = await query(`
      SELECT 
        notification_id,
        user_id,
        title,
        message,
        type,
        is_read,
        created_at
      FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 50;
    `, [userId]);

    const [unread] = await query(`
      SELECT COUNT(*) AS unread_count 
      FROM notifications 
      WHERE user_id = ? AND is_read = FALSE;
    `, [userId]);

    return successResponse(res, {
      notifications,
      unreadCount: unread ? unread.unread_count : 0
    });
  } catch (error) {
    next(error);
  }
}

async function markAsRead(req, res, next) {
  try {
    const notificationId = parseInt(req.params.id, 10);
    const userId = req.user.userId;

    await query(`
      UPDATE notifications 
      SET is_read = TRUE 
      WHERE notification_id = ? AND user_id = ?;
    `, [notificationId, userId]);

    return successResponse(res, null, 'Notification marked as read');
  } catch (error) {
    next(error);
  }
}

async function markAllAsRead(req, res, next) {
  try {
    const userId = req.user.userId;

    await query(`
      UPDATE notifications 
      SET is_read = TRUE 
      WHERE user_id = ?;
    `, [userId]);

    return successResponse(res, null, 'All notifications marked as read');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead
};
