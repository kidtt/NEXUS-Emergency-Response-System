const express = require("express");

const {
    getMyNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead
} = require("../controllers/notificationController");

const {
    authenticate
} = require("../middleware/authMiddleware");

const router = express.Router();


// Get my notifications
router.get(
    "/",
    authenticate,
    getMyNotifications
);


// Get unread count
router.get(
    "/unread-count",
    authenticate,
    getUnreadCount
);


// Mark one as read
router.patch(
    "/:id/read",
    authenticate,
    markAsRead
);


// Mark all as read
router.patch(
    "/read-all",
    authenticate,
    markAllAsRead
);


module.exports = router;