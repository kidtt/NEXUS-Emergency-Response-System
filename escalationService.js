const pool = require("../config/database");
const { createNotification } = require("../controllers/notificationController");

const escalateCriticalIncident = async (incident, analysis) => {
    if (
        !incident ||
        !analysis
    ) {
        return;
    }

    const isCritical =
        incident.severity === "CRITICAL" ||
        analysis.risk_level === "EXTREME" ||
        analysis.priority_score >= 80;

    if (!isCritical) {
        return;
    }

    const [users] = await pool.execute(
        `SELECT id
         FROM users
         WHERE role IN ('ADMIN', 'DISPATCHER')
         AND status = 'ACTIVE'`
    );

    for (const user of users) {
        await createNotification({
            user_id: user.id,
            incident_id: incident.id,
            title: "🚨 CRITICAL INCIDENT ESCALATION",
            message:
                `Incident #${incident.id} requires immediate emergency response. ` +
                `Risk: ${analysis.risk_level}. ` +
                `Priority: ${analysis.priority_score}.`,
            type: "EMERGENCY"
        });
    }

    return true;
};

module.exports = {
    escalateCriticalIncident
};