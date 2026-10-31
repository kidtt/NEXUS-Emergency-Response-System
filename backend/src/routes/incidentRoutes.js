const express = require("express");

const {
    createIncident,
    getIncidents,
    getIncidentById,
    updateIncidentStatus,
    getIncidentTimeline
} = require("../controllers/incidentController");

const {
    authenticate,
    authorize
} = require("../middleware/authMiddleware");

const router = express.Router();


// Report incident
router.post(
    "/",
    authenticate,
    createIncident
);


// Get all incidents
router.get(
    "/",
    authenticate,
    getIncidents
);

router.get(
    "/:id/timeline",
    authenticate,
    getIncidentTimeline
);
// Get one incident
router.get(
    "/:id",
    authenticate,
    getIncidentById
);



// Update status
router.patch(
    "/:id/status",
    authenticate,
    authorize("ADMIN", "DISPATCHER", "RESPONDER"),
    updateIncidentStatus
);


module.exports = router;