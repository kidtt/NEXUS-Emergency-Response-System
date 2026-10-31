const { analyzeIncident } = require("./aiService");
const { predictWithML } = require("./mlService");

const generateIntelligence = async (incident) => {
    const ruleBased = analyzeIncident(incident);

    const reportedDate = new Date(
        incident.reported_at || Date.now()
    );

    const mlInput = {
        incident_type: incident.incident_type,
        severity: incident.severity,
        location_name:
            incident.location_name || "UNKNOWN",
        incident_hour: reportedDate.getHours(),
        day_of_week: reportedDate.getDay() + 1,
        incident_month: reportedDate.getMonth() + 1
    };

    let machineLearning = null;

    try {
        machineLearning =
            await predictWithML(mlInput);
    } catch (error) {
        console.error(
            "ML intelligence error:",
            error.message
        );
    }

    return {
        rule_based_ai: ruleBased,

        machine_learning: machineLearning,

        final_decision: {
            risk_level:
                ruleBased.risk_level,

            priority_score:
                ruleBased.priority_score,

            recommended_team:
                ruleBased.recommended_team,

            response_action:
                ruleBased.response_action,

            confidence_score:
                ruleBased.confidence_score
        }
    };
};

module.exports = {
    generateIntelligence
};