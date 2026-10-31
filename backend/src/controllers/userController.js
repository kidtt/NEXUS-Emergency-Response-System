const pool = require("../config/database");
const {
    createAuditLog
} = require("./auditController");
const {
    isValidId,
    isValidEnum
} = require("../utils/validation");

// GET ALL USERS
const getUsers = async (req, res) => {
    try {
        const [users] = await pool.execute(
            `SELECT
                id,
                full_name,
                email,
                phone,
                role,
                status,
                created_at,
                updated_at
             FROM users
             ORDER BY created_at DESC`
        );

        res.json({
            success: true,
            count: users.length,
            users
        });

    } catch (error) {
        console.error("Get users error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve users"
        });
    }
};


// GET SINGLE USER
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
if (!isValidId(id)) {
    return res.status(400).json({
        success: false,
        message: "Invalid user ID"
    });
}
        const [users] = await pool.execute(
            `SELECT
                id,
                full_name,
                email,
                phone,
                role,
                status,
                created_at,
                updated_at
             FROM users
             WHERE id = ?`,
            [id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.json({
            success: true,
            user: users[0]
        });

    } catch (error) {
        console.error("Get user error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve user"
        });
    }
};


// UPDATE USER STATUS
const updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
if (!isValidId(id)) {
    return res.status(400).json({
        success: false,
        message: "Invalid user ID"
    });
}
        const allowedStatuses = [
            "ACTIVE",
            "INACTIVE",
            "SUSPENDED"
        ];
if (!isValidEnum(status, allowedStatuses)) {
    return res.status(400).json({
        success: false,
        message: "Invalid user status"
    });
}
        if (status !== "ACTIVE") {
    const [[targetUser]] = await pool.execute(
        `SELECT role, status
         FROM users
         WHERE id = ?`,
        [id]
    );

    if (
        targetUser &&
        targetUser.role === "ADMIN" &&
        targetUser.status === "ACTIVE"
    ) {
        const [[adminCount]] = await pool.execute(
            `SELECT COUNT(*) AS count
             FROM users
             WHERE role = 'ADMIN'
             AND status = 'ACTIVE'`
        );

        if (Number(adminCount.count) <= 1) {
            return res.status(400).json({
                success: false,
                message:
                    "Cannot deactivate the last active administrator"
            });
        }
    }
}

        const [result] = await pool.execute(
            `UPDATE users
             SET status = ?
             WHERE id = ?`,
            [status, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
await createAuditLog({
    user_id: req.user.id,
    action: "UPDATE_USER_STATUS",
    entity_type: "USER",
    entity_id: id,
    details: JSON.stringify({
        new_status: status
    }),
    ip_address:
        req.ip || req.socket.remoteAddress
});
        res.json({
            success: true,
            message: "User status updated successfully"
        });

    } catch (error) {
        console.error("Update user status error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update user status"
        });
    }
};


// UPDATE USER ROLE
const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!isValidId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID"
            });
        }

        if (Number(id) === Number(req.user.id)) {
            return res.status(400).json({
                success: false,
                message: "You cannot change your own role"
            });
        }

        const allowedRoles = [
            "ADMIN",
            "DISPATCHER",
            "RESPONDER",
            "CITIZEN"
        ];

        if (!isValidEnum(role, allowedRoles)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user role"
            });
        }

        if (role !== "ADMIN") {
            const [[adminCount]] = await pool.execute(
                `SELECT COUNT(*) AS count
                 FROM users
                 WHERE role = 'ADMIN'
                 AND status = 'ACTIVE'`
            );

            if (Number(adminCount.count) <= 1) {
                const [[targetUser]] = await pool.execute(
                    `SELECT role, status
                     FROM users
                     WHERE id = ?`,
                    [id]
                );

                if (
                    targetUser &&
                    targetUser.role === "ADMIN" &&
                    targetUser.status === "ACTIVE"
                ) {
                    return res.status(400).json({
                        success: false,
                        message:
                            "Cannot remove the last active administrator"
                    });
                }
            }
        }

        const [result] = await pool.execute(
            `UPDATE users
             SET role = ?
             WHERE id = ?`,
            [role, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
await createAuditLog({
    user_id: req.user.id,
    action: "UPDATE_USER_ROLE",
    entity_type: "USER",
    entity_id: id,
    details: JSON.stringify({
        new_role: role
    }),
    ip_address:
        req.ip || req.socket.remoteAddress
});
        res.json({
            success: true,
            message: "User role updated successfully"
        });

    } catch (error) {
        console.error("Update user role error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update user role"
        });
    }
};

module.exports = {
    getUsers,
    getUserById,
    
    updateUserRole,
    
    updateUserStatus
};