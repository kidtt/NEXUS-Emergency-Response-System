const express = require("express");

const {
    getSystemStats,
    getUsers,
    updateUserStatus
} = require("../controllers/adminController");

const {
    authenticate,
    authorize
} = require("../middleware/authMiddleware");

const router = express.Router();


// System statistics
router.get(
    "/stats",
    authenticate,
    authorize("ADMIN"),
    getSystemStats
);


// Get all users
router.get(
    "/users",
    authenticate,
    authorize("ADMIN"),
    getUsers
);


// Update user status
router.patch(
    "/users/:id/status",
    authenticate,
    authorize("ADMIN"),
    updateUserStatus
);


module.exports = router;