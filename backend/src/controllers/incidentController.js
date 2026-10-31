const pool = require("../config/database");

const {
    createNotification
} = require("./notificationController");
const {
    saveAIPrediction,
    saveMLPrediction,
    getIncidentPredictions
} = require("../ai/aiPredictionModelService");
const { createAuditLog } = require("./auditController");
const {
    isValidId,
    isValidEnum,
    isValidCoordinates
} = require("../utils/validation");
const {
    generateIntelligence
} = require("../ai/intelligenceService");
const {
    escalateCriticalIncident
} = require("../services/escalationService");

// CREATE INCIDENT
const createIncident = async (req, res) => {
    try {
        const {
            title,
            description,
            incident_type,
            severity,
            latitude,
            longitude,
            location_name,
            people_affected
        } = req.body;
const allowedIncidentTypes = [
    "FIRE",
    "FLOOD",
    "EARTHQUAKE",
    "ACCIDENT",
    "LANDSLIDE",
    "MEDICAL",
    "SECURITY",
    "OTHER"
];

const allowedSeverities = [
    "LOW",
    "MEDIUM",
    "HIGH",
    "CRITICAL"
];

if (!title || !incident_type) {
    return res.status(400).json({
        success: false,
        message: "Title and incident type are required"
    });
}

if (
    !isValidEnum(
        incident_type,
        allowedIncidentTypes
    )
) {
    return res.status(400).json({
        success: false,
        message: "Invalid incident type"
    });
}

if (
    severity &&
    !isValidEnum(
        severity,
        allowedSeverities
    )
) {
    return res.status(400).json({
        success: false,
        message: "Invalid severity"
    });
}

if (
    !isValidCoordinates(
        latitude,
        longitude
    )
) {
    return res.status(400).json({
        success: false,
        message: "Invalid coordinates"
    });
}
        

        const [result] = await pool.execute(
            `INSERT INTO incidents
            (
                title,
                description,
                incident_type,
                severity,
                latitude,
                longitude,
                location_name,
                people_affected,
                reported_by
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                title,
                description ?? null,
                incident_type,
                severity ?? "MEDIUM",
                latitude ?? null,
                longitude ?? null,
                location_name ?? null,
                Number.isInteger(Number(people_affected)) && Number(people_affected) >= 0 ? Number(people_affected) : 0,
                req.user.id
            ]
        );
// --------------------------------------------------
// NEXUS AI ANALYSIS
// --------------------------------------------------

const [createdIncident] = await pool.execute(
    `SELECT
        id,
        title,
        description,
        incident_type,
        severity,
        status,
        latitude,
        longitude,
        location_name,
        reported_at
     FROM incidents
     WHERE id = ?`,
    [result.insertId]
);

const incident = createdIncident[0];


const intelligence =
    await generateIntelligence(incident);

const aiAnalysis =
    intelligence.rule_based_ai;
    await escalateCriticalIncident(
    incident,
    aiAnalysis
);

const mlPrediction =
    intelligence.machine_learning;
    const [responders] = await pool.execute(
    `SELECT id
     FROM users
     WHERE role IN ('ADMIN', 'DISPATCHER', 'RESPONDER')
     AND status = 'ACTIVE'`
);for (const responder of responders) {

    await createNotification({
        user_id: responder.id,

        incident_id: incident.id,

        title: `🚨 ${incident.incident_type} Emergency`,

        message:
            `New ${incident.incident_type} incident reported at ${
                incident.location_name || "unknown location"
            }. Risk level: ${
                aiAnalysis.risk_level
            }. Priority: ${
                aiAnalysis.priority_score
            }.`,

        type:
            aiAnalysis.risk_level === "EXTREME" ||
            aiAnalysis.risk_level === "HIGH"
                ? "EMERGENCY"
                : "WARNING"
    });
}
    await saveAIPrediction(
    incident.id,
    aiAnalysis
);

if (mlPrediction) {
    await saveMLPrediction(
        incident.id,
        mlPrediction
    );
}
await pool.execute(
    `INSERT INTO incident_updates
    (
        incident_id,
        user_id,
        status,
        message
    )
    VALUES (?, ?, ?, ?)`,
    [
        incident.id,
        req.user.id,
        "REPORTED",
        "Incident reported successfully"
    ]
);
await createAuditLog({
    user_id: req.user.id,
    action: "CREATE_INCIDENT",
    entity_type: "INCIDENT",
    entity_id: incident.id,
    details: JSON.stringify({
        incident_type: incident.incident_type,
        severity: incident.severity,
        location: incident.location_name
    }),
    ip_address:
        req.ip || req.socket.remoteAddress
});

res.status(201).json({
    success: true,

    message: "Incident created successfully",

    incident,

    intelligence: {
        rule_based_ai: aiAnalysis,

        machine_learning: mlPrediction
    }
});

    } catch (error) {
        console.error("Create incident error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create incident"
        });
    }
};


// GET ALL INCIDENTS
const getIncidents = async (req, res) => {
    try {
        const [incidents] = await pool.execute(
            `SELECT
                i.*,
                u.full_name AS reporter_name
             FROM incidents i
             LEFT JOIN users u ON i.reported_by = u.id
             ORDER BY i.reported_at DESC`
        );

        res.json({
            success: true,
            count: incidents.length,
            incidents
        });

    } catch (error) {
        console.error("Get incidents error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve incidents"
        });
    }
};


// GET SINGLE INCIDENT

const getIncidentById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid incident ID"
            });
        }

        const [incidents] = await pool.execute(
            `SELECT
                i.*,
                u.full_name AS reporter_name
             FROM incidents i
             LEFT JOIN users u ON i.reported_by = u.id
             WHERE i.id = ?`,
            [id]
        );

        if (incidents.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Incident not found"
            });
        }

        const incident = incidents[0];

        const predictions =
            await getIncidentPredictions(incident.id);

        const ruleBasedAI =
            predictions.find(
                prediction =>
                    prediction.risk_level ||
                    prediction.priority_score
            ) || null;

        const mlPrediction =
            predictions.find(
                prediction =>
                    prediction.model_version
            ) || null;

        res.json({
            success: true,

            incident,

            intelligence: {
                rule_based_ai: ruleBasedAI,
                machine_learning: mlPrediction
            }
        });

    } catch (error) {
        console.error("Get incident error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve incident"
        });
    }
};

// UPDATE INCIDENT STATUS
const updateIncidentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
if (!isValidId(id)) {
    return res.status(400).json({
        success: false,
        message: "Invalid incident ID"
    });
}
        const allowedStatuses = [
            "REPORTED",
            "VERIFIED",
            "DISPATCHED",
            "IN_PROGRESS",
            "RESOLVED",
            "CLOSED",
            "FALSE_ALARM"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid incident status"
            });
        }
const [existingIncidents] = await pool.execute(
    `SELECT id, status
     FROM incidents
     WHERE id = ?`,
    [id]
);

if (existingIncidents.length === 0) {
    return res.status(404).json({
        success: false,
        message: "Incident not found"
    });
}

const previousStatus =
    existingIncidents[0].status;
    const allowedTransitions = {
    REPORTED: [
        "VERIFIED",
        "FALSE_ALARM"
    ],

    VERIFIED: [
        "DISPATCHED",
        "FALSE_ALARM"
    ],

    DISPATCHED: [
        "IN_PROGRESS",
        "FALSE_ALARM"
    ],

    IN_PROGRESS: [
        "RESOLVED"
    ],

    RESOLVED: [
        "CLOSED"
    ],

    CLOSED: [],

    FALSE_ALARM: []
};

if (
    !allowedTransitions[previousStatus].includes(status)
) {
    return res.status(400).json({
        success: false,
        message:
            `Invalid status transition from ${previousStatus} to ${status}`
    });
}
        const [result] = await pool.execute(
            `UPDATE incidents
             SET status = ?,
                 resolved_at = CASE
                    WHEN ? = 'RESOLVED' THEN CURRENT_TIMESTAMP
                    ELSE resolved_at
                 END
             WHERE id = ?`,
            [status, status, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Incident not found"
            });
        }
       await pool.execute(
    `INSERT INTO incident_updates
    (
        incident_id,
        user_id,
        status,
        message
    )
    VALUES (?, ?, ?, ?)`,
    [
        id,
        req.user.id,
        status,
        `Incident status changed from ${previousStatus} to ${status}`
    ]
); 
await createAuditLog({
    user_id: req.user.id,

    action: "UPDATE_INCIDENT_STATUS",

    entity_type: "INCIDENT",

    entity_id: id,

    details: JSON.stringify({
        previous_status: previousStatus,
        new_status: status
    }),

    ip_address:
        req.ip || req.socket.remoteAddress
});
        res.json({
            success: true,
            message: "Incident status updated successfully"
        });

    } catch (error) {
        console.error("Update incident error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update incident"
        });
    }
};
const getIncidentTimeline = async (req, res) => {
    try {
        const { id } = req.params;
if (!isValidId(id)) {
    return res.status(400).json({
        success: false,
        message: "Invalid incident ID"
    });
}const [incidents] = await pool.execute(
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
        const [rows] = await pool.execute(
            `SELECT
                iu.id,
                iu.incident_id,
                iu.status,
                iu.message,
                iu.created_at,

                u.id AS user_id,
                u.full_name,
                u.role

             FROM incident_updates iu

             LEFT JOIN users u
                ON u.id = iu.user_id

             WHERE iu.incident_id = ?

             ORDER BY iu.created_at ASC`,
            [id]
        );

        res.json({
            success: true,
            incident_id: id,
            timeline: rows
        });

    } catch (error) {

        console.error(
            "Get incident timeline error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to retrieve incident timeline"
        });
    }
};
module.exports = {
    createIncident,
    getIncidents,
    getIncidentById,
    updateIncidentStatus,
    getIncidentTimeline

};