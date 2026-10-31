const express = require("express");

const {
    createResource,
    getResources,
    getAvailableResources,
    updateResource,
    deleteResource,
    assignResource,
    getIncidentResources,
    returnResource
} = require("../controllers/resourceController");

const {
    authenticate,
    authorize
} = require("../middleware/authMiddleware");

const router = express.Router();


// Create resource
router.post(
    "/",
    authenticate,
    authorize("ADMIN", "DISPATCHER"),
    createResource
);


// Get all resources
router.get(
    "/",
    authenticate,
    getResources
);


// Get available resources
router.get(
    "/available",
    authenticate,
    getAvailableResources
);


// Update resource
router.patch(
    "/:id",
    authenticate,
    authorize("ADMIN", "DISPATCHER"),
    updateResource
);


// Delete resource
router.delete(
    "/:id",
    authenticate,
    authorize("ADMIN"),
    deleteResource
);
router.post(
    "/assign",
    authenticate,
    authorize("ADMIN", "DISPATCHER"),
    assignResource
);

router.get(
    "/incident/:incident_id",
    authenticate,
    getIncidentResources
);

router.patch(
    "/assignments/:id/return",
    authenticate,
    authorize("ADMIN", "DISPATCHER", "RESPONDER"),
    returnResource
);
module.exports = router;