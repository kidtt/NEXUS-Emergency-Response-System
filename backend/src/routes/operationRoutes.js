const express = require("express");
const { getOperations, createOperation, updateOperation, deleteOperation } = require("../controllers/operationController");
const { authenticate, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authenticate, getOperations);
router.post("/", authenticate, authorize("ADMIN", "DISPATCHER"), createOperation);
router.patch("/:id", authenticate, authorize("ADMIN", "DISPATCHER"), updateOperation);
router.delete("/:id", authenticate, authorize("ADMIN"), deleteOperation);

module.exports = router;
