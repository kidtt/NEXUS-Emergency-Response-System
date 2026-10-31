const express = require("express");

const {
    createTeam,
    getTeams,
    getAvailableTeams,
    updateTeamStatus,
    addTeamMember,
    getTeamMembers,
    removeTeamMember
} = require("../controllers/teamController");
const {
    authenticate,
    authorize
} = require("../middleware/authMiddleware");

const router = express.Router();


// Create team
router.post(
    "/",
    authenticate,
    authorize("ADMIN", "DISPATCHER"),
    createTeam
);


// Get all teams
router.get(
    "/",
    authenticate,
    getTeams
);


// Get available teams
router.get(
    "/available",
    authenticate,
    getAvailableTeams
);


// Update team status
router.patch(
    "/:id/status",
    authenticate,
    authorize("ADMIN", "DISPATCHER"),
    updateTeamStatus
);
router.post(
    "/members",
    authenticate,
    authorize("ADMIN", "DISPATCHER"),
    addTeamMember
);

router.get(
    "/:team_id/members",
    authenticate,
    getTeamMembers
);

router.delete(
    "/members/:id",
    authenticate,
    authorize("ADMIN", "DISPATCHER"),
    removeTeamMember
);

module.exports = router;