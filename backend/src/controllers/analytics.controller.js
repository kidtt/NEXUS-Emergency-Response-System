const pool = require("../config/database");

// Incidents over time
exports.getIncidentsOverTime = async (req, res) => {
    try {
        const [results] = await pool.execute(`
            SELECT
                DATE(reported_at) AS date,
                COUNT(*) AS count
            FROM incidents
WHERE reported_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
GROUP BY DATE(reported_at)
            ORDER BY date ASC
        `);

        res.json({
            success: true,
            data: results
        });

    } catch (error) {
        console.error(
            "Incidents over time analytics error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to load incident trends"
        });
    }
};


// Incidents by severity
exports.getIncidentsBySeverity = async (req, res) => {
    try {
        const [results] = await pool.execute(`
            SELECT
                severity,
                COUNT(*) AS count
            FROM incidents
            GROUP BY severity
            ORDER BY count DESC
        `);

        res.json({
            success: true,
            data: results
        });

    } catch (error) {
        console.error(
            "Incidents by severity analytics error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to load severity analytics"
        });
    }
};


// Incidents by location
exports.getIncidentsByRegion = async (req, res) => {
    try {
        const [results] = await pool.execute(`
            SELECT
                COALESCE(location_name, 'Unknown') AS region,
                COUNT(*) AS count
            FROM incidents
            GROUP BY location_name
            ORDER BY count DESC
        `);

        res.json({
            success: true,
            data: results
        });

    } catch (error) {
        console.error(
            "Incidents by region analytics error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to load regional analytics"
        });
    }
};


// Incidents by type
exports.getIncidentsByType = async (req, res) => {
    try {
        const [results] = await pool.execute(`
            SELECT
                incident_type,
                COUNT(*) AS count
            FROM incidents
            GROUP BY incident_type
            ORDER BY count DESC
        `);

        res.json({
            success: true,
            data: results
        });

    } catch (error) {
        console.error(
            "Incidents by type analytics error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to load type analytics"
        });
    }
};