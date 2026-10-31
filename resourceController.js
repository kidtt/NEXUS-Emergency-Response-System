const pool = require("../config/database");
const {
    createAuditLog
} = require("./auditController");
const {
    isValidEnum,
    isValidId
} = require("../utils/validation");
// CREATE RESOURCE
const createResource = async (req, res) => {
    try {
        const {
            name,
            resource_type,
            quantity
        } = req.body;
const allowedResourceTypes = [
    "VEHICLE",
    "MEDICAL",
    "EQUIPMENT",
    "SUPPLIES",
    "PERSONNEL",
    "OTHER"
];

if (!name || !resource_type) {
    return res.status(400).json({
        success: false,
        message: "Resource name and type are required"
    });
}

if (!isValidEnum(resource_type, allowedResourceTypes)) {
    return res.status(400).json({
        success: false,
        message: "Invalid resource type"
    });
}

if (
    quantity === undefined ||
    !Number.isInteger(Number(quantity)) ||
    Number(quantity) < 0
) {
    return res.status(400).json({
        success: false,
        message: "Quantity must be a non-negative integer"
    });
}
       const normalizedQuantity = Number(quantity);

        const [result] = await pool.execute(
            `INSERT INTO resources
            (
                name,
                resource_type,
                quantity,

                available_quantity)
            VALUES (?, ?, ?, ?)`,
            [
                name,
                resource_type,
                normalizedQuantity,
                normalizedQuantity
            ]
        );

        res.status(201).json({
            success: true,
            message: "Resource created successfully",
            resource: {
                id: result.insertId,
                name,
                resource_type,
                quantity: normalizedQuantity,
available_quantity: normalizedQuantity,
                status: "AVAILABLE"
            }
        });

    } catch (error) {
        console.error("Create resource error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create resource"
        });
    }
};


// GET ALL RESOURCES
const getResources = async (req, res) => {
    try {
        const [resources] = await pool.execute(
            `SELECT *
             FROM resources
             ORDER BY created_at DESC`
        );

        res.json({
            success: true,
            count: resources.length,
            resources
        });

    } catch (error) {
        console.error("Get resources error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve resources"
        });
    }
};


// GET AVAILABLE RESOURCES
const getAvailableResources = async (req, res) => {
    try {
        const [resources] = await pool.execute(
            `SELECT *
             FROM resources
             WHERE available_quantity > 0
             AND status = 'AVAILABLE'
             ORDER BY name`
        );

        res.json({
            success: true,
            count: resources.length,
            resources
        });

    } catch (error) {
        console.error("Get available resources error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve available resources"
        });
    }
};


// UPDATE RESOURCE
const updateResource = async (req, res) => {
    try {
        const { id } = req.params;
if (!isValidId(id)) {
    return res.status(400).json({
        success: false,
        message: "Invalid resource ID"
    });
}
        const {
            name,
            resource_type,
            quantity,
            status
        } = req.body;

        const [resources] = await pool.execute(
            "SELECT * FROM resources WHERE id = ?",
            [id]
        );

        if (resources.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Resource not found"
            });
        }

        const resource = resources[0];

        const newName = name ?? resource.name;
        const newType = resource_type ?? resource.resource_type;
const newQuantity = Number(
    quantity ?? resource.quantity
);
        const newStatus = status ?? resource.status;
const allowedResourceTypes = [
    "VEHICLE",
    "MEDICAL",
    "EQUIPMENT",
    "SUPPLIES",
    "PERSONNEL",
    "OTHER"
];

const allowedStatuses = [
    "AVAILABLE",
    "IN_USE",
    "MAINTENANCE",
    "UNAVAILABLE"
];

if (!isValidEnum(newType, allowedResourceTypes)) {
    return res.status(400).json({
        success: false,
        message: "Invalid resource type"
    });
}

if (!isValidEnum(newStatus, allowedStatuses)) {
    return res.status(400).json({
        success: false,
        message: "Invalid resource status"
    });
}

if (
    !Number.isInteger(Number(newQuantity)) ||
    Number(newQuantity) < 0
) {
    return res.status(400).json({
        success: false,
        message: "Quantity must be a non-negative integer"
    });
}
        

        const difference =
            newQuantity - resource.quantity;

        const newAvailableQuantity =
            Math.max(
                0,
                resource.available_quantity + difference
            );

        await pool.execute(
            `UPDATE resources
             SET name = ?,
                 resource_type = ?,
                 quantity = ?,
                 available_quantity = ?,
                 status = ?
             WHERE id = ?`,
            [
                newName,
                newType,
                newQuantity,
                newAvailableQuantity,
                newStatus,
                id
            ]
        );

        res.json({
            success: true,
            message: "Resource updated successfully"
        });

    } catch (error) {
        console.error("Update resource error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update resource"
        });
    }
};


// DELETE RESOURCE
const deleteResource = async (req, res) => {
    try {
        const { id } = req.params;
if (!isValidId(id)) {
    return res.status(400).json({
        success: false,
        message: "Invalid resource ID"
    });
}
        const [result] = await pool.execute(
            "DELETE FROM resources WHERE id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Resource not found"
            });
        }

        res.json({
            success: true,
            message: "Resource deleted successfully"
        });

    } catch (error) {
        console.error("Delete resource error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete resource"
        });
    }
};
const assignResource = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        const {
            resource_id,
            incident_id,
            quantity
        } = req.body;

        if (
            !isValidId(resource_id) ||
            !isValidId(incident_id)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid resource or incident ID"
            });
        }

        if (
            !Number.isInteger(Number(quantity)) ||
            Number(quantity) <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be a positive integer"
            });
        }

        const normalizedQuantity = Number(quantity);

        await connection.beginTransaction();

        // Lock resource row
        const [resources] = await connection.execute(
            `SELECT *
             FROM resources
             WHERE id = ?
             FOR UPDATE`,
            [resource_id]
        );

        if (resources.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                success: false,
                message: "Resource not found"
            });
        }

        const resource = resources[0];

        if (
            resource.available_quantity <
            normalizedQuantity
        ) {
            await connection.rollback();

            return res.status(400).json({
                success: false,
                message: "Not enough resource available"
            });
        }

        // Check incident
        const [incidents] = await connection.execute(
            `SELECT id, status
             FROM incidents
             WHERE id = ?`,
            [incident_id]
        );

        if (incidents.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                success: false,
                message: "Incident not found"
            });
        }

        if (
            ["RESOLVED", "CLOSED", "FALSE_ALARM"]
                .includes(incidents[0].status)
        ) {
            await connection.rollback();

            return res.status(400).json({
                success: false,
                message:
                    "Cannot assign resources to this incident"
            });
        }

        // Create assignment
        const [result] = await connection.execute(
            `INSERT INTO resource_assignments
            (
                resource_id,
                incident_id,
                quantity
            )
            VALUES (?, ?, ?)`,
            [
                resource_id,
                incident_id,
                normalizedQuantity
            ]
        );

        // Reduce available quantity
        const newAvailable =
            resource.available_quantity -
            normalizedQuantity;

        let newStatus = resource.status;

        if (newAvailable === 0) {
            newStatus = "IN_USE";
        }

        await connection.execute(
            `UPDATE resources
             SET available_quantity = ?,
                 status = ?
             WHERE id = ?`,
            [
                newAvailable,
                newStatus,
                resource_id
            ]
        );

        await connection.commit();

        // Audit log
        await createAuditLog({
            user_id: req.user.id,
            action: "ASSIGN_RESOURCE",
            entity_type: "RESOURCE",
            entity_id: resource_id,
            details: JSON.stringify({
                incident_id,
                quantity: normalizedQuantity
            }),
            ip_address:
                req.ip || req.socket.remoteAddress
        });

        res.status(201).json({
            success: true,
            message: "Resource assigned successfully",

            assignment: {
                id: result.insertId,
                resource_id,
                incident_id,
                quantity: normalizedQuantity
            }
        });

    } catch (error) {

        await connection.rollback();

        console.error(
            "Assign resource error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to assign resource"
        });

    } finally {
        connection.release();
    }
};
const getIncidentResources = async (
    req,
    res
) => {

    try {

        const { incident_id } =
            req.params;
if (!isValidId(incident_id)) {
    return res.status(400).json({
        success: false,
        message: "Invalid incident ID"
    });
}
        const [rows] =
            await pool.execute(
                `SELECT
                    ra.id,
                    ra.quantity,
                    ra.assigned_at,
                    ra.returned_at,

                    r.name,
                    r.resource_type

                 FROM resource_assignments ra

                 JOIN resources r
                    ON r.id = ra.resource_id

                 WHERE ra.incident_id = ?

                 ORDER BY ra.assigned_at DESC`,
                [incident_id]
            );

        res.json({
            success: true,
            resources: rows
        });

    } catch (error) {

        console.error(
            "Get incident resources error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to retrieve incident resources"
        });
    }
};
const returnResource = async (req, res) => {
    try {
        const { id } = req.params;
if (!isValidId(id)) {
    return res.status(400).json({
        success: false,
        message: "Invalid resource assignment ID"
    });
}
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            const [assignments] = await connection.execute(
                `SELECT
                    id,
                    resource_id,
                    incident_id,
                    quantity,
                    returned_at
                 FROM resource_assignments
                 WHERE id = ?
                 FOR UPDATE`,
                [id]
            );

            if (assignments.length === 0) {
                await connection.rollback();

                return res.status(404).json({
                    success: false,
                    message: "Resource assignment not found"
                });
            }

            const assignment = assignments[0];

            if (assignment.returned_at) {
                await connection.rollback();

                return res.status(400).json({
                    success: false,
                    message: "Resource has already been returned"
                });
            }

            await connection.execute(
                `UPDATE resource_assignments
                 SET returned_at = CURRENT_TIMESTAMP
                 WHERE id = ?`,
                [id]
            );

            await connection.execute(
                `UPDATE resources
                 SET available_quantity =
                    available_quantity + ?,
                     status = 'AVAILABLE'
                 WHERE id = ?`,
                [
                    assignment.quantity,
                    assignment.resource_id
                ]
            );

            await connection.commit();
            await createAuditLog({
    user_id: req.user.id,
    action: "RETURN_RESOURCE",
    entity_type: "RESOURCE",
    entity_id: assignment.resource_id,
    details: JSON.stringify({
        assignment_id: id,
        incident_id: assignment.incident_id,
        quantity: assignment.quantity
    }),
    ip_address:
        req.ip || req.socket.remoteAddress
});

            res.json({
                success: true,
                message: "Resource returned successfully"
            });

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }

    } catch (error) {
        console.error(
            "Return resource error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to return resource"
        });
    }
};
module.exports = {
    createResource,
    getResources,
    getAvailableResources,
    updateResource,
    deleteResource,
    assignResource,
    getIncidentResources,
    returnResource
};