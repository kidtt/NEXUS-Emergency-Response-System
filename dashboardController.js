const pool = require("../config/database");

// GET DASHBOARD OVERVIEW
const getDashboardOverview = async (req, res) => {
    try {
        const [
            [incidentStats],
            [teamStats],
            [resourceStats],
            [userStats],
            [recentIncidents]
        ] = await Promise.all([

            pool.execute(`
                SELECT
                    COUNT(*) AS total_incidents,
                    COALESCE(SUM(status IN ('REPORTED', 'VERIFIED')), 0) AS pending_incidents,
COALESCE(SUM(status = 'IN_PROGRESS'), 0) AS active_incidents,
COALESCE(SUM(
    severity = 'CRITICAL'
    AND status NOT IN ('RESOLVED', 'CLOSED', 'FALSE_ALARM')
), 0) AS critical_incidents,
COALESCE(SUM(status = 'RESOLVED'), 0) AS resolved_incidents
                FROM incidents
            `),

            pool.execute(`
                SELECT
                    COUNT(*) AS total_teams,
                    COALESCE(SUM(status = 'AVAILABLE'), 0) AS available_teams,
COALESCE(SUM(status = 'BUSY'), 0) AS busy_teams,
COALESCE(SUM(status = 'OFFLINE'), 0) AS offline_teams
                FROM response_teams
            `),

            pool.execute(`
                SELECT
                    COUNT(*) AS total_resources,
                    COALESCE(SUM(quantity), 0) AS total_quantity,
                    COALESCE(SUM(available_quantity), 0) AS available_quantity
                FROM resources
            `),

            pool.execute(`
                SELECT
                    COUNT(*) AS total_users,
                   COALESCE(SUM(role = 'CITIZEN'), 0) AS citizens,
COALESCE(SUM(role = 'RESPONDER'), 0) AS responders,
COALESCE(SUM(role = 'DISPATCHER'), 0) AS dispatchers,
COALESCE(SUM(role = 'ADMIN'), 0) AS admins
                FROM users
            `),

            pool.execute(`
                SELECT
                    i.id,
                    i.title,
                    i.incident_type,
                    i.severity,
                    i.status,
                    i.location_name,
                    i.reported_at
                FROM incidents i
                ORDER BY i.reported_at DESC
                LIMIT 10
            `)

        ]);

        res.json({
            success: true,
            dashboard: {
                incidents: incidentStats[0],
                teams: teamStats[0],
                resources: resourceStats[0],
                users: userStats[0],
                recent_incidents: recentIncidents
            }
        });

    } catch (error) {
        console.error("Dashboard overview error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve dashboard data"
        });
    }
};


// INCIDENT STATISTICS
const getIncidentStatistics = async (req, res) => {
    try {
        const [byStatus] = await pool.execute(`
            SELECT
                status,
                COUNT(*) AS count
            FROM incidents
            GROUP BY status
            ORDER BY count DESC
        `);

        const [bySeverity] = await pool.execute(`
            SELECT
                severity,
                COUNT(*) AS count
            FROM incidents
            GROUP BY severity
            ORDER BY count DESC
        `);

        const [byType] = await pool.execute(`
            SELECT
                incident_type,
                COUNT(*) AS count
            FROM incidents
            GROUP BY incident_type
            ORDER BY count DESC
        `);

        res.json({
            success: true,
            statistics: {
                by_status: byStatus,
                by_severity: bySeverity,
                by_type: byType
            }
        });

    } catch (error) {
        console.error("Incident statistics error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve incident statistics"
        });
    }
};


// INCIDENTS BY DAY
const getIncidentTrend = async (req, res) => {
    try {
        const [trend] = await pool.execute(`
            SELECT
                DATE(reported_at) AS date,
                COUNT(*) AS incidents
            FROM incidents
            WHERE reported_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
            GROUP BY DATE(reported_at)
            ORDER BY date ASC
        `);

        res.json({
            success: true,
            trend
        });

    } catch (error) {
        console.error("Incident trend error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve incident trend"
        });
    }
};


// RESPONSE PERFORMANCE
const getResponsePerformance = async (req, res) => {
    try {
        const [performance] = await pool.execute(`
            SELECT
                COUNT(*) AS completed_assignments,
COALESCE(
    ROUND(
        AVG(
            TIMESTAMPDIFF(
                MINUTE,
                ia.assigned_at,
                ia.arrived_at
            )
        ),
        2
    ),
    0
) AS average_response_minutes,

                COALESCE(
    ROUND(
        AVG(
            TIMESTAMPDIFF(
                MINUTE,
                ia.arrived_at,
                ia.completed_at
            )
        ),
        2
    ),
    0
) AS average_resolution_minutes

            FROM incident_assignments ia
            WHERE ia.arrived_at IS NOT NULL
            AND ia.completed_at IS NOT NULL
        `);

        res.json({
            success: true,
            performance: performance[0]
        });

    } catch (error) {
        console.error("Response performance error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve response performance"
        });
    }
};


module.exports = {
    getDashboardOverview,
    getIncidentStatistics,
    getIncidentTrend,
    getResponsePerformance
};