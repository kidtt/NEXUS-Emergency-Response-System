const express = require("express");

const {
    assignTeam,
    getIncidentAssignments,
    markArrived,
    completeAssignment
} = require("../controllers/assignmentController");

const {
    authenticate,
    authorize
} = require("../middleware/authMiddleware");

const router = express.Router();


// Assign team to incident
router.post(
    "/",
    authenticate,
    authorize("ADMIN", "DISPATCHER"),
    assignTeam
);


// Get assignments for incident
router.get(
    "/incident/:incident_id",
    authenticate,
    getIncidentAssignments
);


// Team arrived
router.patch(
    "/:id/arrived",
    authenticate,
    authorize("ADMIN", "DISPATCHER", "RESPONDER"),
    markArrived
);


// Complete assignment
router.patch(
    "/:id/complete",
    authenticate,
    authorize("ADMIN", "DISPATCHER", "RESPONDER"),
    completeAssignment
);


module.exports = router;