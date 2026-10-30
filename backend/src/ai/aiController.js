const {
    saveMLPrediction
} = require("./aiPredictionModelService");
const { predictWithML } = require("./mlService");
const pool = require("../config/database");
const {
    generateRiskPrediction
} = require("./aiPredictionService");
const { analyzeIncident } = require("./aiService");
const {
    calculateDistance
} = require("../utils/geo");
const {
    isValidId
} = require("../utils/validation");
// ANALYZE INCIDENT WITH NEXUS AI
const analyzeIncidentWithAI = async (req, res) => {
    try {
        const { id } = req.params;
if (!isValidId(id)) {
    return res.status(400).json({
        success: false,
        message: "Invalid incident ID"
    });
}
        const [incidents] = await pool.execute(
            `SELECT *
             FROM incidents
             WHERE id = ?`,
            [id]
        );

        if (incidents.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Incident not found"
            });
        }

        const incident = incidents[0];

        const analysis = analyzeIncident(incident);

        const [predictions] = await pool.execute(
            `SELECT *
             FROM ai_predictions
             WHERE incident_id = ?
             ORDER BY created_at DESC`,
            [id]
        );

        res.json({
            success: true,

            incident,

            intelligence: {
                rule_based_ai: analysis,

                stored_predictions: predictions
            }
        });

    } catch (error) {
        console.error(
            "AI incident analysis error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to analyze incident"
        });
    }
};
// GET AI PRIORITY QUEUE
const getAIPriorityQueue = async (req, res) => {
    try {
        const [incidents] = await pool.execute(
            `SELECT
                i.*,
                ap.priority_score,
                ap.risk_level,
                ap.predicted_severity,
                ap.confidence_score,
                ap.recommended_team

             FROM incidents i

             LEFT JOIN (
                SELECT *
                FROM ai_predictions
                WHERE id IN (
                    SELECT MAX(id)
                    FROM ai_predictions
                    GROUP BY incident_id
                )
             ) ap
                ON ap.incident_id = i.id

             WHERE i.status NOT IN
                ('RESOLVED', 'CLOSED', 'FALSE_ALARM')

             ORDER BY
                COALESCE(ap.priority_score, 0) DESC,
                i.reported_at ASC`
        );

        const queue = incidents.map(incident => {

            const analysis = analyzeIncident(incident);

            return {
                incident_id: incident.id,
                title: incident.title,
                incident_type: incident.incident_type,
                severity: incident.severity,
                status: incident.status,
                location: incident.location_name,

                priority_score:
                    incident.priority_score ??
                    analysis.priority_score,

                risk_level:
                    incident.risk_level ??
                    analysis.risk_level,

                predicted_severity:
                    incident.predicted_severity ??
                    analysis.predicted_severity,

                confidence_score:
                    incident.confidence_score ??
                    analysis.confidence_score,

                recommended_team:
                    incident.recommended_team ??
                    analysis.recommended_team,

                reported_at: incident.reported_at
            };
        });

        res.json({
            success: true,
            count: queue.length,
            priority_queue: queue
        });

    } catch (error) {
        console.error(
            "AI priority queue error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to generate AI priority queue"
        });
    }
};
// AI RECOMMENDED RESPONSE TEAM
const getAIRecommendedTeam = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid incident ID"
            });
        }

        const [incidents] = await pool.execute(
            `SELECT *
             FROM incidents
             WHERE id = ?`,
            [id]
        );

        if (incidents.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Incident not found"
            });
        }

        const incident = incidents[0];

        const analysis = analyzeIncident(incident);

        const [teams] = await pool.execute(
            `SELECT
                id,
                name,
                team_type,
                status,
                location_name,
                latitude,
                longitude
             FROM response_teams
             WHERE status = 'AVAILABLE'
             AND team_type = ?`,
            [analysis.recommended_team]
        );

if (teams.length === 0) {
    return res.json({
        success: true,
        incident_id: id,
        recommendation: analysis,
        selected_team: null,
        alternatives: [],
        message: "No suitable available team found"
    });
}

if (
    incident.latitude === null ||
    incident.longitude === null
) {
    return res.json({
        success: true,
        incident_id: id,
        recommendation: analysis,
        selected_team: teams[0],
        alternatives: teams.slice(1),
        message:
            "Incident coordinates unavailable. Teams returned without distance ranking."
    });
}
        

        const rankedTeams = teams
            .map(team => ({
                ...team,
                distance_km:
                    calculateDistance(
                        incident.latitude,
                        incident.longitude,
                        team.latitude,
                        team.longitude
                    )
            }))
            .sort((a, b) => {

                if (
                    a.distance_km === null &&
                    b.distance_km === null
                ) {
                    return 0;
                }

                if (a.distance_km === null) {
                    return 1;
                }

                if (b.distance_km === null) {
                    return -1;
                }

                return (
                    a.distance_km -
                    b.distance_km
                );
            });

        res.json({
            success: true,

            incident_id: id,

            recommendation: {
                recommended_team_type:
                    analysis.recommended_team,

                risk_level:
                    analysis.risk_level,

                priority_score:
                    analysis.priority_score,

                confidence_score:
                    analysis.confidence_score
            },

            selected_team:
                rankedTeams[0],

            alternatives:
                rankedTeams.slice(1)
        });

    } catch (error) {
        console.error(
            "AI recommended team error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to generate team recommendation"
        });
    }
};
// AI HISTORICAL RISK ANALYSIS
const getAIRiskAnalysis = async (req, res) => {
    try {
        const [incidents] = await pool.execute(
            `SELECT
                id,
                title,
                incident_type,
                severity,
                status,
                location_name,
                latitude,
                longitude,
                reported_at
             FROM incidents
             WHERE status NOT IN
                ('RESOLVED', 'CLOSED', 'FALSE_ALARM')
             ORDER BY reported_at DESC`
        );

        const riskAnalysis = incidents
            .map(incident => {

                const analysis =
                    analyzeIncident(incident);

                return {
                    incident_id: incident.id,
                    title: incident.title,
                    incident_type:
                        incident.incident_type,
                    severity:
                        incident.severity,
                    status:
                        incident.status,
                    location:
                        incident.location_name,

                    risk_level:
                        analysis.risk_level,

                    severity_score:
                        analysis.severity_score,

                    priority_score:
                        analysis.priority_score,

                    confidence_score:
                        analysis.confidence_score,

                    recommended_team:
                        analysis.recommended_team,

                    recommendation:
                        analysis.recommendation,

                    explanation:
                        analysis.explanation,

                    reported_at:
                        incident.reported_at
                };
            })
            .sort(
                (a, b) =>
                    b.priority_score -
                    a.priority_score
            );

        res.json({
            success: true,
            count: riskAnalysis.length,
            risk_analysis: riskAnalysis
        });

    } catch (error) {
        console.error(
            "AI risk analysis error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to generate risk analysis"
        });
    }
};
// AI RISK PREDICTION
const getAIRiskPrediction = async (req, res) => {
    try {
        const prediction =
            await generateRiskPrediction();

        res.json({
            success: true,
            message:
                "NEXUS AI risk prediction generated successfully",
            prediction
        });

    } catch (error) {
        console.error(
            "AI risk prediction error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to generate AI risk prediction"
        });
    }
};
const getMLPrediction = async (req, res) => {

    try {

        const {
            incident_id,
            incident_type,
            severity,
            location_name,
            incident_hour,
            day_of_week,
            incident_month
        } = req.body;
if (!isValidId(incident_id)) {
    return res.status(400).json({
        success: false,
        message: "Invalid incident ID"
    });
}
        if (
            !incident_id ||
            !incident_type ||
            !severity ||
            !location_name ||
            incident_hour === undefined ||
            day_of_week === undefined ||
            incident_month === undefined
        ) {
            return res.status(400).json({
                success: false,
                message: "All ML prediction fields are required"
            });
        }
if (
    !Number.isInteger(Number(incident_hour)) ||
    Number(incident_hour) < 0 ||
    Number(incident_hour) > 23
) {
    return res.status(400).json({
        success: false,
        message: "Invalid incident hour"
    });
}

if (
    !Number.isInteger(Number(day_of_week)) ||
    Number(day_of_week) < 1 ||
    Number(day_of_week) > 7
) {
    return res.status(400).json({
        success: false,
        message: "Invalid day of week"
    });
}

if (
    !Number.isInteger(Number(incident_month)) ||
    Number(incident_month) < 1 ||
    Number(incident_month) > 12
) {
    return res.status(400).json({
        success: false,
        message: "Invalid incident month"
    });
}
        const prediction = await predictWithML({
            incident_type,
            severity,
            location_name,
            incident_hour,
            day_of_week,
            incident_month
        });

        const predictionId = await saveMLPrediction(
            incident_id,
            prediction
        );

        res.json({
            success: true,

            model: "nexus-emergency-model",

            prediction_id: predictionId,

            incident_id,

            prediction
        });

    } catch (error) {

        console.error(
            "ML prediction error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "ML prediction failed"
        });
    }
};
const getAIPredictionHistory = async (req, res) => {
    try {
        const { id } = req.params;
if (!isValidId(id)) {
    return res.status(400).json({
        success: false,
        message: "Invalid incident ID"
    });
}
        const [incidents] = await pool.execute(
            `SELECT id
             FROM incidents
             WHERE id = ?`,
            [id]
        );

        if (incidents.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Incident not found"
            });
        }

        const [predictions] = await pool.execute(
            `SELECT
                id,
                predicted_type,
                predicted_severity,
                severity_score,
                priority_score,
                risk_level,
                confidence_score,
                recommended_team,
                recommendation,
explanation,
response_action,
model_version,
                created_at
             FROM ai_predictions
             WHERE incident_id = ?
             ORDER BY created_at DESC`,
            [id]
        );

        res.json({
            success: true,
            incident_id: id,
            count: predictions.length,
            predictions
        });

    } catch (error) {
        console.error(
            "AI prediction history error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to retrieve AI prediction history"
        });
    }
};
module.exports = {
    analyzeIncidentWithAI,
    getAIPriorityQueue,
    getAIRecommendedTeam,
    getAIRiskAnalysis,
    getAIPredictionHistory,
    getMLPrediction,
    getAIRiskPrediction

};