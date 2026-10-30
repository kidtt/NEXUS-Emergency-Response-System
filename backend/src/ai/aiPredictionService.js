const pool = require("../config/database");

/*
    NEXUS AI — PREDICTION SERVICE

    This service prepares historical emergency data
    for future machine-learning predictions.
*/

// Get historical incident features
const getHistoricalFeatures = async () => {
    const [rows] = await pool.execute(`
        SELECT
            incident_type,
            severity,
            status,
            location_name,
            latitude,
            longitude,
            HOUR(reported_at) AS incident_hour,
            DAYOFWEEK(reported_at) AS day_of_week,
            MONTH(reported_at) AS incident_month
        FROM incidents
        WHERE reported_at >= DATE_SUB(
            NOW(),
            INTERVAL 6 MONTH
        )
        ORDER BY reported_at ASC
    `);

    return rows;
};


// Generate statistical prediction
const generateRiskPrediction = async () => {

    const historicalData =
        await getHistoricalFeatures();

    if (historicalData.length === 0) {
        return {
            prediction_available: false,
            message:
                "Not enough historical incident data"
        };
    }

    // Count incidents by location
    const locationStats = {};

    historicalData.forEach(incident => {

        const location =
            incident.location_name || "UNKNOWN";

        if (!locationStats[location]) {
            locationStats[location] = {
                incidents: 0,
                critical: 0,
                high: 0
            };
        }

        locationStats[location].incidents++;

        if (incident.severity === "CRITICAL") {
            locationStats[location].critical++;
        }

        if (incident.severity === "HIGH") {
            locationStats[location].high++;
        }
    });


    const predictions =
        Object.entries(locationStats)
            .map(([location, stats]) => {

                const score = Math.min(
                    100,
                    stats.incidents * 3 +
                    stats.high * 7 +
                    stats.critical * 12
                );

                let risk;

                if (score >= 75) {
                    risk = "EXTREME";
                } else if (score >= 50) {
                    risk = "HIGH";
                } else if (score >= 25) {
                    risk = "MEDIUM";
                } else {
                    risk = "LOW";
                }

                return {
                    location,
                    historical_incidents:
                        stats.incidents,

                    critical_incidents:
                        stats.critical,

                    high_incidents:
                        stats.high,

                    prediction_score:
                        score,

                    predicted_risk:
                        risk
                };
            })
            .sort(
                (a, b) =>
                    b.prediction_score -
                    a.prediction_score
            );


    return {
        prediction_available: true,

        historical_records:
            historicalData.length,

        predictions
    };
};


module.exports = {
    getHistoricalFeatures,
    generateRiskPrediction
};