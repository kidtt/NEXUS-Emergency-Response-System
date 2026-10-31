const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const hpp = require("hpp");
const timeout = require("connect-timeout");
const rateLimit = require("express-rate-limit");
const pool = require("./config/database");
const authRoutes = require("./routes/authRoutes");
const incidentRoutes = require("./routes/incidentRoutes");
const teamRoutes = require("./routes/teamRoutes");
const assignmentRoutes = require("./routes/assignmentRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const resourceRoutes = require("./routes/resourceRoutes");
const adminRoutes = require("./routes/adminRoutes");
const auditRoutes = require("./routes/auditRoutes");
const userRoutes = require("./routes/userRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const analyticsRoutes = require("./routes/analytics.routes");
const aiRoutes = require("./ai/aiRoutes");
const operationRoutes = require("./routes/operationRoutes");

const app = express();
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: {
        success: false,
        message: "Too many authentication requests. Please try again later."
    }
});
app.use(helmet());
app.use(hpp());
app.use(timeout("15s"));
app.use(cors({
    origin: (origin, callback) => {
        if (
            !origin ||
            origin === "null" ||
            /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
        ) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json({ limit: "1mb" }));
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/incidents", incidentRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/users", userRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/operations", operationRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "NEXUS Emergency Response API is running"
    });
});
app.get("/api/health/db", async (req, res) => {
    try {
        const [result] = await pool.query("SELECT 1 AS connected");

        res.json({
            success: true,
            message: "Database connected successfully",
            result
        });

    } catch (error) {
        console.error("Database connection error:", error);

        res.status(500).json({
            success: false,
            message: "Database connection failed"
        });
    }
});
app.use((err, req, res, next) => {
    console.error("Unhandled server error:", err);

    res.status(500).json({
        success: false,
        message: "Internal server error"
    });
});
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "API endpoint not found"
    });
});
module.exports = app;
