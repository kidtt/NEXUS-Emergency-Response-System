const pool = require("../config/database");
const {
    isValidId
} = require("../utils/validation");

// GET AUDIT LOGS
const getAuditLogs = async (req, res) => {
    try {
        const [logs] = await pool.execute(
            `SELECT
                a.*,
                u.full_name,
                u.email
             FROM audit_logs a
             LEFT JOIN users u
                ON a.user_id = u.id
             ORDER BY a.created_at DESC
             LIMIT 500`
        );

        res.json({
            success: true,
            count: logs.length,
            logs
        });

    } catch (error) {
        console.error("Get audit logs error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve audit logs"
        });
    }
};

const createAuditLog = async ({
    user_id,
    action,
    entity_type,
    entity_id,
    details,
    ip_address
}) => {

    if (
        user_id !== undefined &&
        user_id !== null &&
        !isValidId(user_id)
    ) {
        throw new Error("Invalid audit user ID");
    }

    if (
        entity_id !== undefined &&
        entity_id !== null &&
        !isValidId(entity_id)
    ) {
        throw new Error("Invalid audit entity ID");
    }

    if (!action) {
        throw new Error("Audit action is required");
    }

    const [result] = await pool.execute(
        `INSERT INTO audit_logs
        (
            user_id,
            action,
            entity_type,
            entity_id,
            details,
            ip_address
        )
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
            user_id ?? null,
            action,
            entity_type ?? null,
            entity_id ?? null,
            details ?? null,
            ip_address ?? null
        ]
    );

    return result.insertId;
};
module.exports = {
    createAuditLog,
    getAuditLogs
};