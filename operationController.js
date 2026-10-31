const pool = require("../config/database");
const { isValidId, isValidEnum } = require("../utils/validation");

const allowedPriorities = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const allowedStatuses = ["ACTIVE", "STANDBY", "COMPLETED", "CANCELLED"];

const getOperations = async (req, res) => {
    try {
        const [rows] = await pool.execute(
            `SELECT * FROM operations ORDER BY created_at DESC`
        );
        res.json({ success: true, count: rows.length, operations: rows });
    } catch (error) {
        console.error("Get operations error:", error);
        res.status(500).json({ success: false, message: "Failed to retrieve operations" });
    }
};

const createOperation = async (req, res) => {
    try {
        const { name, operation_type, location_name, priority, status } = req.body;

        if (!name || !operation_type) {
            return res.status(400).json({ success: false, message: "Operation name and type are required" });
        }

        const normalizedPriority = priority ? String(priority).toUpperCase() : "MEDIUM";
        const normalizedStatus = status ? String(status).toUpperCase() : "ACTIVE";

        if (!isValidEnum(normalizedPriority, allowedPriorities)) {
            return res.status(400).json({ success: false, message: "Invalid operation priority" });
        }

        if (!isValidEnum(normalizedStatus, allowedStatuses)) {
            return res.status(400).json({ success: false, message: "Invalid operation status" });
        }

        const [result] = await pool.execute(
            `INSERT INTO operations (name, operation_type, location_name, priority, status, created_by)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [name, operation_type, location_name || null, normalizedPriority, normalizedStatus, req.user.id]
        );

        res.status(201).json({
            success: true,
            message: "Operation created successfully",
            operation: { id: result.insertId, name, operation_type, location_name: location_name || null, priority: normalizedPriority, status: normalizedStatus }
        });
    } catch (error) {
        console.error("Create operation error:", error);
        res.status(500).json({ success: false, message: "Failed to create operation" });
    }
};

const updateOperation = async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidId(id)) {
            return res.status(400).json({ success: false, message: "Invalid operation ID" });
        }

        const [existingRows] = await pool.execute("SELECT * FROM operations WHERE id = ?", [id]);
        if (existingRows.length === 0) {
            return res.status(404).json({ success: false, message: "Operation not found" });
        }
        const existing = existingRows[0];

        const name = req.body.name ?? existing.name;
        const operation_type = req.body.operation_type ?? existing.operation_type;
        const location_name = req.body.location_name === undefined ? existing.location_name : req.body.location_name;
        const priority = req.body.priority ? String(req.body.priority).toUpperCase() : existing.priority;
        const status = req.body.status ? String(req.body.status).toUpperCase() : existing.status;

        if (!isValidEnum(priority, allowedPriorities)) {
            return res.status(400).json({ success: false, message: "Invalid operation priority" });
        }
        if (!isValidEnum(status, allowedStatuses)) {
            return res.status(400).json({ success: false, message: "Invalid operation status" });
        }

        await pool.execute(
            `UPDATE operations SET name = ?, operation_type = ?, location_name = ?, priority = ?, status = ? WHERE id = ?`,
            [name, operation_type, location_name, priority, status, id]
        );

        res.json({ success: true, message: "Operation updated successfully" });
    } catch (error) {
        console.error("Update operation error:", error);
        res.status(500).json({ success: false, message: "Failed to update operation" });
    }
};

const deleteOperation = async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidId(id)) {
            return res.status(400).json({ success: false, message: "Invalid operation ID" });
        }

        const [result] = await pool.execute("DELETE FROM operations WHERE id = ?", [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Operation not found" });
        }

        res.json({ success: true, message: "Operation deleted successfully" });
    } catch (error) {
        console.error("Delete operation error:", error);
        res.status(500).json({ success: false, message: "Failed to delete operation" });
    }
};

module.exports = { getOperations, createOperation, updateOperation, deleteOperation };
