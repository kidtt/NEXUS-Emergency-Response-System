const pool = require("../config/database");
const {
    isValidId,
    isValidEnum
} = require("../utils/validation");
// GET MY NOTIFICATIONS
const getMyNotifications = async (req, res) => {
    try {
        const [notifications] = await pool.execute(
            `SELECT
                n.*,
                i.title AS incident_title
             FROM notifications n
             LEFT JOIN incidents i
                ON n.incident_id = i.id
             WHERE n.user_id = ?
             ORDER BY n.created_at DESC`,
            [req.user.id]
        );

        res.json({
            success: true,
            count: notifications.length,
            notifications
        });

    } catch (error) {
        console.error("Get notifications error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve notifications"
        });
    }
};


// GET UNREAD COUNT
const getUnreadCount = async (req, res) => {
    try {
        const [result] = await pool.execute(
            `SELECT COUNT(*) AS unread_count
             FROM notifications
             WHERE user_id = ?
             AND is_read = FALSE`,
            [req.user.id]
        );

        res.json({
            success: true,
            unread_count: result[0].unread_count
        });

    } catch (error) {
        console.error("Unread count error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to get unread notification count"
        });
    }
};


// MARK NOTIFICATION AS READ
const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
if (!isValidId(id)) {
    return res.status(400).json({
        success: false,
        message: "Invalid notification ID"
    });
}
        const [result] = await pool.execute(
            `UPDATE notifications
             SET is_read = TRUE
             WHERE id = ?
             AND user_id = ?`,
            [id, req.user.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Notification not found"
            });
        }

        res.json({
            success: true,
            message: "Notification marked as read"
        });

    } catch (error) {
        console.error("Mark notification error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update notification"
        });
    }
};


// MARK ALL AS READ
const markAllAsRead = async (req, res) => {
    try {
        await pool.execute(
            `UPDATE notifications
             SET is_read = TRUE
             WHERE user_id = ?`,
            [req.user.id]
        );

        res.json({
            success: true,
            message: "All notifications marked as read"
        });

    } catch (error) {
        console.error("Mark all notifications error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update notifications"
        });
    }
};

const createNotification = async ({
    user_id,
    incident_id,
    title,
    message,
    type = "INFO"
}) => {
    const allowedTypes = [
    "INFO",
    "WARNING",
    "EMERGENCY",
    "SYSTEM"
];

if (!isValidId(user_id)) {
    throw new Error("Invalid notification user ID");
}

if (
    incident_id !== undefined &&
    incident_id !== null &&
    !isValidId(incident_id)
) {
    throw new Error("Invalid notification incident ID");
}

if (!title || !message) {
    throw new Error(
        "Notification title and message are required"
    );
}

if (!isValidEnum(type, allowedTypes)) {
    throw new Error("Invalid notification type");
}

    const [result] = await pool.execute(
        `INSERT INTO notifications
        (
            user_id,
            incident_id,
            title,
            message,
            type
        )
        VALUES (?, ?, ?, ?, ?)`,
        [
            user_id,
incident_id ?? null,            title,
            message,
            type
        ]
    );

    return result.insertId;
};
module.exports = {
    getMyNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    createNotification

};