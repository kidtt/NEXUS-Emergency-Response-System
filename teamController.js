const pool = require("../config/database");
const {
    isValidId,
    isValidEnum,
    isValidCoordinates
} = require("../utils/validation");
// CREATE RESPONSE TEAM
const createTeam = async (req, res) => {
    try {
        const {
            name,
            team_type,
            location_name,
            latitude,
            longitude
        } = req.body;
const allowedTeamTypes = [
    "FIRE",
    "MEDICAL",
    "POLICE",
    "RESCUE",
    "DISASTER",
    "OTHER"
];

if (!name || !team_type) {
    return res.status(400).json({
        success: false,
        message: "Team name and team type are required"
    });
}

if (!isValidEnum(team_type, allowedTeamTypes)) {
    return res.status(400).json({
        success: false,
        message: "Invalid team type"
    });
}

if (!isValidCoordinates(latitude, longitude)) {
    return res.status(400).json({
        success: false,
        message: "Invalid team coordinates"
    });
}
       
        const [result] = await pool.execute(
            `INSERT INTO response_teams
            (
                name,
                team_type,
                location_name,
                latitude,
                longitude
            )
            VALUES (?, ?, ?, ?, ?)`,
            [
                name,
                team_type,
                location_name ?? null,
                latitude ?? null,
                longitude ?? null
            ]
        );

        res.status(201).json({
            success: true,
            message: "Response team created successfully",
            team: {
                id: result.insertId,
                name,
                team_type,
                status: "AVAILABLE"
            }
        });

    } catch (error) {
        console.error("Create team error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create response team"
        });
    }
};


// GET ALL TEAMS
const getTeams = async (req, res) => {
    try {
        const [teams] = await pool.execute(
            `SELECT *
             FROM response_teams
             ORDER BY created_at DESC`
        );

        res.json({
            success: true,
            count: teams.length,
            teams
        });

    } catch (error) {
        console.error("Get teams error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve response teams"
        });
    }
};


// GET AVAILABLE TEAMS
const getAvailableTeams = async (req, res) => {
    try {
        const [teams] = await pool.execute(
            `SELECT *
             FROM response_teams
             WHERE status = 'AVAILABLE'
             ORDER BY name`
        );

        res.json({
            success: true,
            count: teams.length,
            teams
        });

    } catch (error) {
        console.error("Get available teams error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve available teams"
        });
    }
};


// UPDATE TEAM STATUS
const updateTeamStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
if (!isValidId(id)) {
    return res.status(400).json({
        success: false,
        message: "Invalid team ID"
    });
}
        const allowedStatuses = [
            "AVAILABLE",
            "BUSY",
            "OFFLINE"
        ];

if (!isValidEnum(status, allowedStatuses)) {
        return res.status(400).json({
                success: false,
                message: "Invalid team status"
            });
        }

        const [result] = await pool.execute(
            `UPDATE response_teams
             SET status = ?
             WHERE id = ?`,
            [status, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Response team not found"
            });
        }

        res.json({
            success: true,
            message: "Team status updated successfully"
        });

    } catch (error) {
        console.error("Update team status error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update team status"
        });
    }
};
const addTeamMember = async (req, res) => {
    try {
        const { team_id, user_id } = req.body;

        if (
    !isValidId(team_id) ||
    !isValidId(user_id)
) {
    return res.status(400).json({
        success: false,
        message: "Invalid team ID or user ID"
    });
}

        const [teams] = await pool.execute(
            `SELECT id FROM response_teams WHERE id = ?`,
            [team_id]
        );

        if (teams.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Team not found"
            });
        }

        const [users] = await pool.execute(
            `SELECT id, role, status
             FROM users
             WHERE id = ?`,
            [user_id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (
            users[0].role !== "RESPONDER"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Only responders can be assigned to response teams"
            });
        }

        if (
            users[0].status !== "ACTIVE"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Responder account is not active"
            });
        }

        const [existing] = await pool.execute(
            `SELECT id
             FROM team_members
             WHERE team_id = ?
             AND user_id = ?`,
            [team_id, user_id]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message:
                    "Responder is already a member of this team"
            });
        }

        const [result] = await pool.execute(
            `INSERT INTO team_members
            (team_id, user_id)
            VALUES (?, ?)`,
            [team_id, user_id]
        );

        res.status(201).json({
            success: true,
            message:
                "Responder added to team successfully",
            member_id: result.insertId
        });

    } catch (error) {

        console.error(
            "Add team member error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to add team member"
        });
    }
};
const getTeamMembers = async (req, res) => {
    try {
        const { team_id } = req.params;
if (!isValidId(team_id)) {
    return res.status(400).json({
        success: false,
        message: "Invalid team ID"
    });
}
        const [rows] = await pool.execute(
            `SELECT
                tm.id,
                u.id AS user_id,
                u.full_name,
                u.email,
                u.phone,
                u.status,
                tm.team_id

             FROM team_members tm

             JOIN users u
                ON u.id = tm.user_id

             WHERE tm.team_id = ?

             ORDER BY u.full_name ASC`,
            [team_id]
        );

        res.json({
            success: true,
            members: rows
        });

    } catch (error) {

        console.error(
            "Get team members error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to retrieve team members"
        });
    }
};
const removeTeamMember = async (req, res) => {
    try {
        const { id } = req.params;
if (!isValidId(id)) {
    return res.status(400).json({
        success: false,
        message: "Invalid team member ID"
    });
}
        const [result] = await pool.execute(
            `DELETE FROM team_members
             WHERE id = ?`,
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Team member not found"
            });
        }

        res.json({
            success: true,
            message:
                "Responder removed from team successfully"
        });

    } catch (error) {

        console.error(
            "Remove team member error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to remove team member"
        });
    }
};

module.exports = {
    createTeam,
    getTeams,
    getAvailableTeams,
    updateTeamStatus,
    addTeamMember,
    getTeamMembers,
    removeTeamMember
};