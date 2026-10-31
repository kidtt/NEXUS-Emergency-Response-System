const express = require("express");

const {
    analyzeIncidentWithAI,
    getAIPriorityQueue,
    getAIRecommendedTeam,
    getAIRiskAnalysis,
    getAIRiskPrediction,
    getMLPrediction,
    getAIPredictionHistory
} = require("./aiController");

const {
    authenticate,
    authorize
} = require("../middleware/authMiddleware");

const router = express.Router();


// ANALYZE INCIDENT WITH AI
router.get(
    "/incident/:id",
    authenticate,
    authorize("ADMIN", "DISPATCHER", "RESPONDER"),
    analyzeIncidentWithAI
);


// AI PRIORITY QUEUE
router.get(
    "/priority-queue",
    authenticate,
    authorize("ADMIN", "DISPATCHER"),
    getAIPriorityQueue
);


// AI RECOMMENDED TEAM
router.get(
    "/recommended-team/:id",
    authenticate,
    authorize("ADMIN", "DISPATCHER"),
    getAIRecommendedTeam
);


// AI RISK ANALYSIS
router.get(
    "/risk-analysis",
    authenticate,
    authorize("ADMIN", "DISPATCHER"),
    getAIRiskAnalysis
);


// AI RISK PREDICTION
router.get(
    "/risk-prediction",
    authenticate,
    authorize("ADMIN", "DISPATCHER"),
    getAIRiskPrediction
);


// MACHINE LEARNING PREDICTION
router.post(
    "/ml-predict",
    authenticate,
    authorize("ADMIN", "DISPATCHER"),
    getMLPrediction
);


// AI PREDICTION HISTORY
router.get(
    "/prediction-history/:id",
    authenticate,
    authorize("ADMIN", "DISPATCHER", "RESPONDER"),
    getAIPredictionHistory
);


module.exports = router;