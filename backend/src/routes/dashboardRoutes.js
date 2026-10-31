const express = require("express");

const {
    getDashboardOverview,
    getIncidentStatistics,
    getIncidentTrend,
    getResponsePerformance
} = require("../controllers/dashboardController");

const {
    authenticate,
    authorize
} = require("../middleware/authMiddleware");

const router = express.Router();


// Main dashboard
router.get(
    "/overview",
    authenticate,
    authorize("ADMIN", "DISPATCHER"),
    getDashboardOverview
);


// Incident statistics
router.get(
    "/incidents",
    authenticate,
    authorize("ADMIN", "DISPATCHER"),
    getIncidentStatistics
);


// 30-day incident trend
router.get(
    "/trend",
    authenticate,
    authorize("ADMIN", "DISPATCHER"),
    getIncidentTrend
);


// Response performance
router.get(
    "/performance",
    authenticate,
    authorize("ADMIN", "DISPATCHER"),
    getResponsePerformance
);


module.exports = router;