const pool = require("../config/database");
const {
    isValidId,
    isValidEnum
} = require("../utils/validation");
// GET SYSTEM STATISTICS
const getSystemStats = async (req, res) => {
    try {
        const [[users]] = await pool.execute(
            `SELECT COUNT(*) AS total_users
             FROM users`
        );

        const [[incidents]] = await pool.execute(
            `SELECT COUNT(*) AS total_incidents
             FROM incidents`
        );

        const [[activeIncidents]] = await pool.execute(
            `SELECT COUNT(*) AS active_incidents
             FROM incidents
             WHERE status IN ('REPORTED', 'VERIFIED', 'DISPATCHED', 'IN_PROGRESS')`
        );

        const [[resolvedIncidents]] = await pool.execute(
            `SELECT COUNT(*) AS resolved_incidents
             FROM incidents
             WHERE status IN ('RESOLVED', 'CLOSED')`
        );

        const [[teams]] = await pool.execute(
            `SELECT COUNT(*) AS total_teams
             FROM response_teams`
        );

        const [[availableTeams]] = await pool.execute(
            `SELECT COUNT(*) AS available_teams
             FROM response_teams
             WHERE status = 'AVAILABLE'`
        );

        const [[resources]] = await pool.execute(
            `SELECT COUNT(*) AS total_resources
             FROM resources`
        );

        res.json({
            success: true,
            statistics: {
                users: users.total_users,
                incidents: incidents.total_incidents,
                active_incidents: activeIncidents.active_incidents,
                resolved_incidents: resolvedIncidents.resolved_incidents,
                teams: teams.total_teams,
                available_teams: availableTeams.available_teams,
                resources: resources.total_resources
            }
        });

    } catch (error) {
        console.error("System statistics error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve system statistics"
        });
    }
};


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






// UPDATE USER STATUS
const updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const allowedStatuses = [
            "ACTIVE",
            "INACTIVE",
            "SUSPENDED"
        ];

        if (!isValidId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID"
            });
        }

        if (!isValidEnum(status, allowedStatuses)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user status"
            });
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


module.exports = {
    getSystemStats,
    getUsers,
    updateUserStatus
};


