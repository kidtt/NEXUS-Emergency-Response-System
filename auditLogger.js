const pool = require("../config/database");

const logAction = async ({
    user_id,
    action,
    entity_type,
    entity_id,
    details,
    ip_address
}) => {
    try {
        await pool.execute(
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
                user_id || null,
                action,
                entity_type || null,
                entity_id || null,
                details || null,
                ip_address || null
            ]
        );
    } catch (error) {
        console.error("Audit logging error:", error);
    }
};

module.exports = {
    logAction
};