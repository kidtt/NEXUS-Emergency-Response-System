const express = require("express");

const router = express.Router();

const analyticsController = require("../controllers/analytics.controller");

const {
    authenticate,
    authorize
} = require("../middleware/authMiddleware");

router.get(
    "/incidents-over-time",
    authenticate,
    authorize("ADMIN", "DISPATCHER"),
    analyticsController.getIncidentsOverTime
);

router.get(
    "/incidents-by-severity",
    authenticate,
    authorize("ADMIN", "DISPATCHER"),
    analyticsController.getIncidentsBySeverity
);

router.get(
    "/incidents-by-region",
    authenticate,
    authorize("ADMIN", "DISPATCHER"),
    analyticsController.getIncidentsByRegion
);

router.get(
    "/incidents-by-type",
    authenticate,
    authorize("ADMIN", "DISPATCHER"),
    analyticsController.getIncidentsByType
);

module.exports = router;