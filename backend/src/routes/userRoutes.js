const express = require("express");

const {
    getUsers,
    getUserById,
    updateUserStatus,
    updateUserRole
} = require("../controllers/userController");

const {
    authenticate,
    authorize
} = require("../middleware/authMiddleware");

const router = express.Router();

// Get all users
router.get(
    "/",
    authenticate,
    authorize("ADMIN"),
    getUsers
);

// Get one user
router.get(
    "/:id",
    authenticate,
    authorize("ADMIN"),
    getUserById
);

// Update user status
router.patch(
    "/:id/status",
    authenticate,
    authorize("ADMIN"),
    updateUserStatus
);

// Update user role
router.patch(
    "/:id/role",
    authenticate,
    authorize("ADMIN"),
    updateUserRole
);

module.exports = router;