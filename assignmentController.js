const pool = require("../config/database");
const {
    createAuditLog
} = require("./auditController");
const { createNotification } = require("./notificationController");
const {
    isValidId
} = require("../utils/validation");
// ASSIGN TEAM TO INCIDENT
const assignTeam = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        const { incident_id, team_id } = req.body;
        if (
    !isValidId(incident_id) ||
    !isValidId(team_id)
) {
    return res.status(400).json({
        success: false,
        message: "Invalid incident or team ID"
    });
}

       
        await connection.beginTransaction();

        // Check incident
        const [incidents] = await connection.execute(
            "SELECT * FROM incidents WHERE id = ? FOR UPDATE",
            [incident_id]
        );

        if (incidents.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                success: false,
                message: "Incident not found"
            });
        }

        const incident = incidents[0];

        if (
            incident.status === "RESOLVED" ||
            incident.status === "CLOSED" ||
            incident.status === "FALSE_ALARM"
        ) {
            await connection.rollback();

            return res.status(400).json({
                success: false,
                message: "Cannot assign a team to a closed incident"
            });
        }

        // Check team
        const [teams] = await connection.execute(
            "SELECT * FROM response_teams WHERE id = ? FOR UPDATE",
            [team_id]
        );

        if (teams.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                success: false,
                message: "Response team not found"
            });
        }

        const team = teams[0];

        if (team.status !== "AVAILABLE") {
            await connection.rollback();

            return res.status(400).json({
                success: false,
                message: "Response team is not available"
            });
        }

        // Assign team
        const [result] = await connection.execute(
            `INSERT INTO incident_assignments
            (incident_id, team_id, assigned_by)
            VALUES (?, ?, ?)`,
            [incident_id, team_id, req.user.id]
        );

        // Team becomes busy
        await connection.execute(
            `UPDATE response_teams
             SET status = 'BUSY'
             WHERE id = ?`,
            [team_id]
        );

        // Incident becomes dispatched
        await connection.execute(
            `UPDATE incidents
             SET status = 'DISPATCHED'
             WHERE id = ?`,
            [incident_id]
        );

        // Add incident update
        await connection.execute(
            `INSERT INTO incident_updates
            (incident_id, user_id, status, message)
            VALUES (?, ?, ?, ?)`,
            [
                incident_id,
                req.user.id,
                "DISPATCHED",
                `Response team "${team.name}" has been dispatched`
            ]
        );

        await connection.commit();
        const [teamMembers] = await pool.execute(
    `SELECT user_id
     FROM team_members
     WHERE team_id = ?`,
    [team_id]
);

for (const member of teamMembers) {
    await createNotification({
        user_id: member.user_id,
        incident_id,
        title: "🚨 New Emergency Assignment",
        message:
            `Your team has been dispatched to incident #${incident_id}.`,
        type: "EMERGENCY"
    });
}
        await createAuditLog({
    user_id: req.user.id,
    action: "ASSIGN_TEAM",
    entity_type: "INCIDENT",
    entity_id: incident_id,
    details: JSON.stringify({
        team_id: team_id
    }),
    ip_address:
        req.ip || req.socket.remoteAddress
});

        res.status(201).json({
            success: true,
            message: "Response team assigned successfully",
            assignment: {
                id: result.insertId,
                incident_id,
                team_id,
                team_name: team.name,
                status: "DISPATCHED"
            }
        });

    } catch (error) {
        await connection.rollback();

        console.error("Assign team error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to assign response team"
        });

    } finally {
        connection.release();
    }
};


// GET INCIDENT ASSIGNMENTS
const getIncidentAssignments = async (req, res) => {
    try {
        const { incident_id } = req.params;
if (!isValidId(incident_id)) {
    return res.status(400).json({
        success: false,
        message: "Invalid incident ID"
    });
}
        const [assignments] = await pool.execute(
            `SELECT
                ia.*,
                rt.name AS team_name,
                rt.team_type,
                rt.status AS team_status,
                u.full_name AS assigned_by_name
             FROM incident_assignments ia
             JOIN response_teams rt
                ON ia.team_id = rt.id
             LEFT JOIN users u
                ON ia.assigned_by = u.id
             WHERE ia.incident_id = ?
             ORDER BY ia.assigned_at DESC`,
            [incident_id]
        );

        res.json({
            success: true,
            count: assignments.length,
            assignments
        });

    } catch (error) {
        console.error("Get assignments error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve assignments"
        });
    }
};


// MARK TEAM AS ARRIVED
const markArrived = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid assignment ID"
            });
        }

        const [assignments] = await pool.execute(
            `SELECT *
             FROM incident_assignments
             WHERE id = ?`,
            [id]
        );

        if (assignments.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Assignment not found"
            });
        }

        const assignment = assignments[0];

        if (assignment.arrived_at) {
            return res.status(400).json({
                success: false,
                message: "Team has already arrived"
            });
        }

        await pool.execute(
            `UPDATE incident_assignments
             SET arrived_at = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [id]
        );

        await pool.execute(
            `UPDATE incidents
             SET status = 'IN_PROGRESS'
             WHERE id = ?`,
            [assignment.incident_id]
        );

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
                assignment.incident_id,
                req.user.id,
                "IN_PROGRESS",
                "Response team has arrived at the incident location."
            ]
        );

        const [users] = await pool.execute(
            `SELECT id
             FROM users
             WHERE role IN ('ADMIN', 'DISPATCHER')
             AND status = 'ACTIVE'`
        );

        for (const user of users) {
            await createNotification({
                user_id: user.id,
                incident_id: assignment.incident_id,
                title: "📍 Response Team Arrived",
                message:
                    `The response team has arrived at incident #${assignment.incident_id}.`,
                type: "INFO"
            });
        }

        await createAuditLog({
            user_id: req.user.id,
            action: "TEAM_ARRIVED",
            entity_type: "INCIDENT",
            entity_id: assignment.incident_id,
            details: JSON.stringify({
                assignment_id: id,
                team_id: assignment.team_id
            }),
            ip_address:
                req.ip || req.socket.remoteAddress
        });

        res.json({
            success: true,
            message: "Team arrival recorded"
        });

    } catch (error) {
        console.error("Mark arrival error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to record team arrival"
        });
    }
};

// COMPLETE ASSIGNMENT
const completeAssignment = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid assignment ID"
            });
        }

        await connection.beginTransaction();

        const [assignments] = await connection.execute(
            `SELECT *
             FROM incident_assignments
             WHERE id = ?
             FOR UPDATE`,
            [id]
        );

        if (assignments.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                success: false,
                message: "Assignment not found"
            });
        }

        const assignment = assignments[0];

        if (assignment.completed_at) {
            await connection.rollback();

            return res.status(400).json({
                success: false,
                message: "Assignment already completed"
            });
        }

        await connection.execute(
            `UPDATE incident_assignments
             SET completed_at = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [id]
        );

        await connection.execute(
            `UPDATE response_teams
             SET status = 'AVAILABLE'
             WHERE id = ?`,
            [assignment.team_id]
        );

        await connection.execute(
            `UPDATE incidents
             SET status = 'RESOLVED',
                 resolved_at = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [assignment.incident_id]
        );

        await connection.execute(
            `INSERT INTO incident_updates
            (
                incident_id,
                user_id,
                status,
                message
            )
            VALUES (?, ?, ?, ?)`,
            [
                assignment.incident_id,
                req.user.id,
                "RESOLVED",
                "Incident response has been completed and the incident is resolved."
            ]
        );

        await connection.commit();

        const [users] = await pool.execute(
            `SELECT id
             FROM users
             WHERE role IN ('ADMIN', 'DISPATCHER')
             AND status = 'ACTIVE'`
        );

        for (const user of users) {
            await createNotification({
                user_id: user.id,
                incident_id: assignment.incident_id,
                title: "✅ Incident Resolved",
                message:
                    `Incident #${assignment.incident_id} has been resolved.`,
                type: "INFO"
            });
        }

        await createAuditLog({
            user_id: req.user.id,
            action: "COMPLETE_ASSIGNMENT",
            entity_type: "INCIDENT",
            entity_id: assignment.incident_id,
            details: JSON.stringify({
                assignment_id: id,
                team_id: assignment.team_id
            }),
            ip_address:
                req.ip || req.socket.remoteAddress
        });

        res.json({
            success: true,
            message: "Response assignment completed successfully"
        });

    } catch (error) {
        await connection.rollback();

        console.error("Complete assignment error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to complete assignment"
        });

    } finally {
        connection.release();
    }
};
module.exports = {
    assignTeam,
    getIncidentAssignments,
    markArrived,
    completeAssignment
};