const { test, describe, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { randomUUID } = require("node:crypto");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const app = require("../src/app");
const pool = require("../src/config/database");

let server;
let baseUrl;
const created = {
    userIds: [],
    incidentIds: [],
    operationIds: [],
    teamIds: [],
    resourceIds: [],
    predictionIds: []
};

const adminEmail = `nexus-test-admin-${Date.now()}@example.test`;
const citizenEmail = `nexus-test-citizen-${Date.now()}@example.test`;
const adminPassword = randomUUID();
const citizenPassword = randomUUID();
let adminToken = "";
let citizenToken = "";

async function request(path, options = {}) {
    const response = await fetch(`${baseUrl}${path}`, options);
    let body = null;
    const text = await response.text();
    if (text) {
        try {
            body = JSON.parse(text);
        } catch {
            body = text;
        }
    }
    return { status: response.status, body };
}

before(async () => {
    server = app.listen(0);
    await new Promise((resolve) => server.on("listening", resolve));
    baseUrl = `http://127.0.0.1:${server.address().port}`;

    const adminHash = await bcrypt.hash(adminPassword, 10);
    const [adminResult] = await pool.execute(
        `INSERT INTO users (full_name, email, password_hash, role, status) VALUES (?, ?, ?, 'ADMIN', 'ACTIVE')`,
        ["NEXUS Test Admin", adminEmail, adminHash]
    );
    created.userIds.push(adminResult.insertId);

    const citizenHash = await bcrypt.hash(citizenPassword, 10);
    const [citizenResult] = await pool.execute(
        `INSERT INTO users (full_name, email, password_hash, role, status) VALUES (?, ?, ?, 'CITIZEN', 'ACTIVE')`,
        ["NEXUS Test Citizen", citizenEmail, citizenHash]
    );
    created.userIds.push(citizenResult.insertId);

    const login = await request("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: adminEmail, password: adminPassword })
    });
    assert.equal(login.status, 200);
    assert.ok(login.body.token);
    adminToken = login.body.token;

    const citizenLogin = await request("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: citizenEmail, password: citizenPassword })
    });
    assert.equal(citizenLogin.status, 200);
    assert.ok(citizenLogin.body.token);
    citizenToken = citizenLogin.body.token;
});

after(async () => {
    for (const id of created.incidentIds) {
        await pool.execute("DELETE FROM notifications WHERE incident_id = ?", [id]);
        await pool.execute("DELETE FROM ai_predictions WHERE incident_id = ?", [id]);
        await pool.execute("DELETE FROM incident_updates WHERE incident_id = ?", [id]);
        await pool.execute("DELETE FROM resource_assignments WHERE incident_id = ?", [id]);
        await pool.execute("DELETE FROM incident_assignments WHERE incident_id = ?", [id]);
        await pool.execute("DELETE FROM incidents WHERE id = ?", [id]);
    }
    for (const id of created.operationIds) {
        await pool.execute("DELETE FROM operations WHERE id = ?", [id]);
    }
    for (const id of created.resourceIds) {
        await pool.execute("DELETE FROM resource_assignments WHERE resource_id = ?", [id]);
        await pool.execute("DELETE FROM resources WHERE id = ?", [id]);
    }
    for (const id of created.teamIds) {
        await pool.execute("DELETE FROM team_members WHERE team_id = ?", [id]);
        await pool.execute("DELETE FROM response_teams WHERE id = ?", [id]);
    }
    for (const id of created.predictionIds) {
        await pool.execute("DELETE FROM ai_predictions WHERE id = ?", [id]);
    }
    for (const id of created.userIds) {
        await pool.execute("DELETE FROM users WHERE id = ?", [id]);
    }
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
    await pool.end();
});

describe("NEXUS API", { concurrency: 1 }, () => {
    test("health endpoint reports database connectivity", async () => {
        const result = await request("/api/health/db");
        assert.equal(result.status, 200);
        assert.equal(result.body.success, true);
    });

    test("login rejects invalid credentials", async () => {
        const result = await request("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: adminEmail, password: "wrong-password" })
        });
        assert.equal(result.status, 401);
        assert.equal(result.body.success, false);
    });

    test("protected endpoint rejects missing token", async () => {
        const result = await request("/api/incidents");
        assert.equal(result.status, 401);
        assert.equal(result.body.success, false);
    });

    test("incident validation rejects incomplete data", async () => {
        const result = await request("/api/incidents", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${adminToken}`
            },
            body: JSON.stringify({ title: "Incomplete incident" })
        });
        assert.equal(result.status, 400);
        assert.equal(result.body.success, false);
    });

    test("incident creation stores a valid report", async () => {
        const result = await request("/api/incidents", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${adminToken}`
            },
            body: JSON.stringify({
                title: "Automated test incident",
                incident_type: "FIRE",
                severity: "HIGH",
                location_name: "Test Location",
                people_affected: 3
            })
        });
        assert.equal(result.status, 201);
        assert.equal(result.body.success, true);
        assert.ok(result.body.incident.id);
        created.incidentIds.push(result.body.incident.id);
        if (result.body.intelligence?.machine_learning?.prediction_id) {
            created.predictionIds.push(result.body.intelligence.machine_learning.prediction_id);
        }
    });

    test("citizen cannot create an operation", async () => {
        const result = await request("/api/operations", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${citizenToken}`
            },
            body: JSON.stringify({
                name: "Unauthorized operation",
                operation_type: "Test",
                priority: "HIGH"
            })
        });
        assert.equal(result.status, 403);
        assert.equal(result.body.success, false);
    });

    test("operation CRUD works for administrators", async () => {
        const create = await request("/api/operations", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${adminToken}`
            },
            body: JSON.stringify({
                name: "Automated test operation",
                operation_type: "Test Response",
                location_name: "Test City",
                priority: "MEDIUM",
                status: "ACTIVE"
            })
        });
        assert.equal(create.status, 201);
        assert.ok(create.body.operation.id);
        const operationId = create.body.operation.id;
        created.operationIds.push(operationId);

        const list = await request("/api/operations", {
            headers: { "Authorization": `Bearer ${adminToken}` }
        });
        assert.equal(list.status, 200);
        assert.ok(Array.isArray(list.body.operations));

        const update = await request(`/api/operations/${operationId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${adminToken}`
            },
            body: JSON.stringify({ status: "COMPLETED" })
        });
        assert.equal(update.status, 200);

        const remove = await request(`/api/operations/${operationId}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${adminToken}` }
        });
        assert.equal(remove.status, 200);
        created.operationIds = created.operationIds.filter((id) => id !== operationId);
    });

    test("resource assignment and return handle insufficient stock", async () => {
        const create = await request("/api/resources", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${adminToken}`
            },
            body: JSON.stringify({
                name: "Automated test resource",
                resource_type: "SUPPLIES",
                quantity: 1
            })
        });
        assert.equal(create.status, 201);
        const resourceId = create.body.resource.id;
        created.resourceIds.push(resourceId);

        const insufficient = await request("/api/resources/assign", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${adminToken}`
            },
            body: JSON.stringify({
                resource_id: resourceId,
                incident_id: 1,
                quantity: 2
            })
        });
        assert.equal(insufficient.status, 400);
        assert.equal(insufficient.body.success, false);

        const validAssignment = await request("/api/resources/assign", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${adminToken}`
            },
            body: JSON.stringify({
                resource_id: resourceId,
                incident_id: 1,
                quantity: 1
            })
        });
        assert.equal(validAssignment.status, 201);
        assert.ok(validAssignment.body.assignment.id);
        const assignmentId = validAssignment.body.assignment.id;

        const returned = await request(`/api/resources/assignments/${assignmentId}/return`, {
            method: "PATCH",
            headers: { "Authorization": `Bearer ${adminToken}` }
        });
        assert.equal(returned.status, 200);

        const removed = await request(`/api/resources/${resourceId}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${adminToken}` }
        });
        assert.equal(removed.status, 200);
        created.resourceIds = created.resourceIds.filter((id) => id !== resourceId);
    });

    test("team creation and status update work", async () => {
        const create = await request("/api/teams", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${adminToken}`
            },
            body: JSON.stringify({
                name: "Automated test team",
                team_type: "RESCUE",
                location_name: "Test City"
            })
        });
        assert.equal(create.status, 201);
        const teamId = create.body.team.id;
        created.teamIds.push(teamId);

        const update = await request(`/api/teams/${teamId}/status`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${adminToken}`
            },
            body: JSON.stringify({ status: "OFFLINE" })
        });
        assert.equal(update.status, 200);
    });

    test("team member add and remove enforce responder role", async () => {
        const teamId = created.teamIds[created.teamIds.length - 1];
        assert.ok(teamId);

        const invalid = await request("/api/teams/members", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${adminToken}`
            },
            body: JSON.stringify({
                team_id: teamId,
                user_id: created.userIds[0]
            })
        });
        assert.equal(invalid.status, 400);

        const [responders] = await pool.execute("SELECT id FROM users WHERE role = 'RESPONDER' AND status = 'ACTIVE' LIMIT 1");
        if (responders.length === 0) {
            return;
        }
        const responderId = responders[0].id;

        const added = await request("/api/teams/members", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${adminToken}`
            },
            body: JSON.stringify({
                team_id: teamId,
                user_id: responderId
            })
        });
        assert.equal(added.status, 201);
        const memberId = added.body.member_id;

        const removed = await request(`/api/teams/members/${memberId}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${adminToken}` }
        });
        assert.equal(removed.status, 200);
    });

    test("dashboard overview has expected structure", async () => {
        const result = await request("/api/dashboard/overview", {
            headers: { "Authorization": `Bearer ${adminToken}` }
        });
        assert.equal(result.status, 200);
        assert.equal(result.body.success, true);
        assert.ok(result.body.dashboard?.incidents);
        assert.ok(result.body.dashboard?.teams);
        assert.ok(result.body.dashboard?.resources);
    });

    test("ML prediction endpoint returns a prediction", async () => {
        const result = await request("/api/ai/ml-predict", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${adminToken}`
            },
            body: JSON.stringify({
                incident_id: created.incidentIds[0],
                incident_type: "FIRE",
                severity: "HIGH",
                location_name: "Test Location",
                incident_hour: 10,
                day_of_week: 2,
                incident_month: 4
            })
        });
        assert.equal(result.status, 200);
        assert.equal(result.body.success, true);
        assert.ok(result.body.prediction);
        if (result.body.prediction_id) {
            created.predictionIds.push(result.body.prediction_id);
        }
    });
});

