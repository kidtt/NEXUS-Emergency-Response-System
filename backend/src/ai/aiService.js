const analyzeIncident = (incident) => {
    const {
        incident_type,
        severity
    } = incident;

    const description = incident.description || "";
    const location_name = incident.location_name || "";

    const text = `${description} ${location_name}`.toLowerCase();

    // --------------------------------------------------
    // 1. INCIDENT CLASSIFICATION
    // --------------------------------------------------

    let classification = incident_type || "OTHER";

    const keywords = {
        FIRE: ["fire", "burn", "smoke", "flame"],
        FLOOD: ["flood", "water", "overflow", "rain"],
        EARTHQUAKE: ["earthquake", "quake", "tremor", "building collapsed"],
        ACCIDENT: ["accident", "crash", "collision", "vehicle"],
        LANDSLIDE: ["landslide", "mudslide", "soil collapse"],
        MEDICAL: ["injury", "injured", "sick", "medical", "unconscious"],
        SECURITY: ["attack", "robbery", "violence", "threat"]
    };

    for (const [type, words] of Object.entries(keywords)) {
        if (words.some(word => text.includes(word))) {
            classification = type;
            break;
        }
    }

    // --------------------------------------------------
    // 2. SEVERITY SCORE
    // --------------------------------------------------

    let severityScore = 0;

    if (severity === "CRITICAL") severityScore += 80;
    else if (severity === "HIGH") severityScore += 60;
    else if (severity === "MEDIUM") severityScore += 40;
    else severityScore += 20;

    const criticalKeywords = [
        "death",
        "dead",
        "fatal",
        "collapsed",
        "trapped",
        "multiple victims",
        "mass casualty",
        "explosion"
    ];

    const highRiskKeywords = [
        "injured",
        "smoke",
        "fire",
        "flood",
        "accident",
        "danger",
        "emergency"
    ];

    criticalKeywords.forEach(word => {
        if (text.includes(word)) {
            severityScore += 10;
        }
    });

    highRiskKeywords.forEach(word => {
        if (text.includes(word)) {
            severityScore += 5;
        }
    });

    severityScore = Math.min(severityScore, 100);

    // --------------------------------------------------
    // 3. AI PREDICTED SEVERITY
    // --------------------------------------------------

    let predictedSeverity;

    if (severityScore >= 80) {
        predictedSeverity = "CRITICAL";
    } else if (severityScore >= 60) {
        predictedSeverity = "HIGH";
    } else if (severityScore >= 35) {
        predictedSeverity = "MEDIUM";
    } else {
        predictedSeverity = "LOW";
    }

    // --------------------------------------------------
    // 4. PRIORITY SCORE
    // --------------------------------------------------

    let priorityScore = severityScore;

    if (classification === "FIRE") priorityScore += 8;
    if (classification === "EARTHQUAKE") priorityScore += 10;
    if (classification === "FLOOD") priorityScore += 7;
    if (classification === "MEDICAL") priorityScore += 6;

    priorityScore = Math.min(priorityScore, 100);

    // --------------------------------------------------
    // 5. RECOMMENDED RESPONSE TEAM
    // --------------------------------------------------

    const recommendedTeams = {
        FIRE: "FIRE",
        FLOOD: "DISASTER",
        EARTHQUAKE: "RESCUE",
        ACCIDENT: "RESCUE",
        LANDSLIDE: "RESCUE",
        MEDICAL: "MEDICAL",
        SECURITY: "POLICE",
        OTHER: "DISASTER"
    };

    const recommendedTeam =
        recommendedTeams[classification] || "DISASTER";

    // --------------------------------------------------
    // 6. RISK LEVEL
    // --------------------------------------------------

    let riskLevel;

    if (priorityScore >= 80) {
        riskLevel = "EXTREME";
    } else if (priorityScore >= 60) {
        riskLevel = "HIGH";
    } else if (priorityScore >= 35) {
        riskLevel = "MEDIUM";
    } else {
        riskLevel = "LOW";
    }

    // --------------------------------------------------
    // 7. RESPONSE RECOMMENDATION
    // --------------------------------------------------

    const responseRecommendations = {
        FIRE:
            "Dispatch fire rescue immediately and assess nearby structures for evacuation.",

        FLOOD:
            "Deploy disaster response personnel, assess affected areas and prepare evacuation if necessary.",

        EARTHQUAKE:
            "Deploy rescue teams immediately and prioritize collapsed structures and trapped victims.",

        ACCIDENT:
            "Dispatch rescue and medical teams. Secure the accident area and assess injured persons.",

        LANDSLIDE:
            "Deploy rescue personnel and restrict access to the affected area due to secondary collapse risk.",

        MEDICAL:
            "Dispatch medical responders immediately and prioritize patients according to urgency.",

        SECURITY:
            "Dispatch police/security personnel and secure the incident area.",

        OTHER:
            "Dispatch an appropriate emergency response team and perform an initial risk assessment."
    };

    const recommendation =
        responseRecommendations[classification] ||
        responseRecommendations.OTHER;

    // --------------------------------------------------
    // 8. AI EXPLANATION
    // --------------------------------------------------

    const explanation =
        `NEXUS AI classified this incident as ${classification}. ` +
        `The calculated priority score is ${priorityScore}/100 ` +
        `with a ${riskLevel} risk level. ` +
        `Recommended response team: ${recommendedTeam}.`;
// --------------------------------------------------
// // --------------------------------------------------
// 9. AI CONFIDENCE SCORE
// --------------------------------------------------

let confidenceScore = 70;

// Strong classification evidence
if (incident_type && incident_type !== "OTHER") {
    confidenceScore += 10;
}

// Description provides additional evidence
if (description.trim().length >= 20) {
    confidenceScore += 5;
}

// Matching emergency keywords
if (
    criticalKeywords.some(word => text.includes(word)) ||
    highRiskKeywords.some(word => text.includes(word))
) {
    confidenceScore += 5;
}

confidenceScore = Math.min(confidenceScore, 99);


// Confidence explanation
let confidenceLevel;

if (confidenceScore >= 90) {
    confidenceLevel = "VERY_HIGH";
} else if (confidenceScore >= 80) {
    confidenceLevel = "HIGH";
} else if (confidenceScore >= 70) {
    confidenceLevel = "MEDIUM";
} else {
    confidenceLevel = "LOW";
}


// --------------------------------------------------
// 10. RESPONSE ACTION
// --------------------------------------------------

let responseAction;

if (riskLevel === "EXTREME") {
    responseAction =
        "IMMEDIATE DISPATCH REQUIRED. Escalate to emergency command and prioritize this incident.";
} else if (riskLevel === "HIGH") {
    responseAction =
        "URGENT RESPONSE REQUIRED. Dispatch the recommended response team as soon as possible.";
} else if (riskLevel === "MEDIUM") {
    responseAction =
        "MONITOR AND RESPOND. Assign an appropriate team and continue monitoring the incident.";
} else {
    responseAction =
        "STANDARD RESPONSE. Handle through normal emergency response procedures.";
}


// --------------------------------------------------
// 11. FINAL AI RESULT
// --------------------------------------------------

return {
    classification,
    predicted_severity: predictedSeverity,
    severity_score: severityScore,
    priority_score: priorityScore,
    risk_level: riskLevel,
    recommended_team: recommendedTeam,
    confidence_score: confidenceScore,
    confidence_level: confidenceLevel,
    recommendation,
    explanation,
    response_action: responseAction
};}

module.exports = {
    analyzeIncident
};