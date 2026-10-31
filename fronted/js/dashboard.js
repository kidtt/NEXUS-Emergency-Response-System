
document.addEventListener("DOMContentLoaded", function () {

    /* =========================================================
       NEXUS — ADMIN COMMAND CENTER
       Complete Frontend Controller
    ========================================================= */

    const navItems = document.querySelectorAll(".nav-item");

    const dashboard = document.querySelector(".dashboard-grid");
    const stats = document.querySelector(".stats-grid");
    const alertBox = document.querySelector(".emergency-alert");
    const bottomGrid = document.querySelector(".bottom-grid");

    const incidentsPage = document.getElementById("incidentsPage");
    const operationsPage = document.getElementById("operationsPage");
    const teamsPage = document.getElementById("teamsPage");
    const resourcesPage = document.getElementById("resourcesPage");
    const analyticsPage = document.getElementById("analyticsPage");
    const settingsPage = document.getElementById("settingsPage");

    /* =========================================================
       PAGE TITLES
    ========================================================= */

    const pageInfo = {
        "Command Center": {
            title: "Command Center",
            subtitle: "Ethiopia Emergency Operations Network"
        },
        "Incidents": {
            title: "Emergency Incidents",
            subtitle: "Monitor, investigate and coordinate active incidents"
        },
        "Operations": {
            title: "Response Operations",
            subtitle: "Coordinate and monitor emergency response operations"
        },
        "Response Teams": {
            title: "Response Teams",
            subtitle: "Monitor and coordinate emergency response personnel"
        },
        "Resources": {
            title: "Emergency Resources",
            subtitle: "Monitor and manage critical response resources"
        },
        "Analytics": {
    title: "Emergency Analytics",
    subtitle: "Intelligence and performance overview"
},
"Settings": {
    title: "System Settings",
    subtitle: "Configure NEXUS emergency operations preferences"
}
    };

    /* =========================================================
       STORAGE
    ========================================================= */

    const STORAGE = {
        incidents: "nexusIncidents",
        operations: "nexusOperations",
        teams: "nexusTeams",
        resources: "nexusResources",
        settings: "nexusSettings"
    };
/* =========================================================
   NEXUS API
========================================================= */

const API_BASE_URL = "http://localhost:5000/api";

function getAdminToken() {
    return (
        localStorage.getItem("nexus_token") ||
        sessionStorage.getItem("nexus_token")
    );
}

async function fetchIncidentsFromBackend() {

    const token = getAdminToken();

    if (!token) {
        console.warn("No NEXUS authentication token found.");
        return [];
    }

    try {

        const response = await fetch(
            `${API_BASE_URL}/incidents`,
            {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }
        );

        if (response.status === 401) {
            console.warn("Admin session expired.");
            return [];
        }

        const data = await response.json();

        if (!response.ok || !data.success) {
            console.error(
                "Failed to load incidents:",
                data
            );
            return [];
        }

        return data.incidents || [];

    } catch (error) {

        console.error(
            "Dashboard incident API error:",
            error
        );

        return [];
    }
}
    async function fetchTeamsFromBackend() {
        const token = getAdminToken();
        if (!token) return [];

        try {
            const response = await fetch(`${API_BASE_URL}/teams`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (response.status === 401) {
                console.warn("Admin session expired.");
                return [];
            }

            const data = await response.json();
            if (!response.ok || !data.success) {
                console.error("Failed to load teams:", data);
                return [];
            }

            return data.teams || [];
        } catch (error) {
            console.error("Dashboard team API error:", error);
            return [];
        }
    }

    async function createTeamOnBackend(teamData) {
        const token = getAdminToken();
        if (!token) throw new Error("Authentication required");

        const response = await fetch(`${API_BASE_URL}/teams`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(teamData)
        });

        const data = await response.json();
        if (response.status === 401) {
            localStorage.removeItem("nexus_token");
            sessionStorage.removeItem("nexus_token");
            localStorage.removeItem("nexus_user");
            throw new Error("Your session has expired. Please login again.");
        }
        if (!response.ok || !data.success) {
            throw new Error(data.message || "Failed to create response team.");
        }
        return data;
    }

    async function updateTeamStatusOnBackend(teamId, status) {
        const token = getAdminToken();
        if (!token) throw new Error("Authentication required");

        const response = await fetch(`${API_BASE_URL}/teams/${teamId}/status`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ status })
        });

        const data = await response.json();
        if (response.status === 401) {
            localStorage.removeItem("nexus_token");
            sessionStorage.removeItem("nexus_token");
            localStorage.removeItem("nexus_user");
            throw new Error("Your session has expired. Please login again.");
        }
        if (!response.ok || !data.success) {
            throw new Error(data.message || "Failed to update team status.");
        }
        return data;
    }
    function getData(key) {
        try {
            return JSON.parse(localStorage.getItem(key)) || [];
        } catch {
            return [];
        }
    }

    function saveData(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    /* =========================================================
       TOP BAR
    ========================================================= */

    function updatePageTitle(title, subtitle) {

        const topTitle = document.querySelector(".topbar h1");
        const topSubtitle = document.querySelector(".topbar p");

        if (topTitle) topTitle.textContent = title;
        if (topSubtitle) topSubtitle.textContent = subtitle;
    }

    /* =========================================================
       HIDE EVERYTHING
    ========================================================= */

    function hideEverything() {

        [
            dashboard,
            stats,
            alertBox,
            bottomGrid,
            incidentsPage,
            operationsPage,
            teamsPage,
            resourcesPage,
            analyticsPage,
                settingsPage

        ].forEach(element => {
            if (element) {
                element.style.display = "none";
            }
        });

        closeAllPanels();
    }

    /* =========================================================
       CLOSE FORM PANELS
    ========================================================= */

    function closeAllPanels() {

        document
            .querySelectorAll(
                ".incident-form-panel.open, .nexus-action-panel.open"
            )
            .forEach(panel => {
                panel.classList.remove("open");
            });
    }

    /* =========================================================
       COMMAND CENTER
    ========================================================= */

    function showDashboard() {

        hideEverything();

        if (dashboard) dashboard.style.display = "grid";
        if (stats) stats.style.display = "grid";
        if (alertBox) alertBox.style.display = "flex";
        if (bottomGrid) bottomGrid.style.display = "grid";

        updatePageTitle(
            pageInfo["Command Center"].title,
            pageInfo["Command Center"].subtitle
        );

        updateDashboardStats();
    }

    /* =========================================================
       SHOW PAGE
    ========================================================= */

    function showPage(page, name) {

        hideEverything();

        if (page) {
            page.style.display = "block";
        }

        if (pageInfo[name]) {
            updatePageTitle(
                pageInfo[name].title,
                pageInfo[name].subtitle
            );
        }
    }

    /* =========================================================
       NAVIGATION
    ========================================================= */

    navItems.forEach(item => {

        item.addEventListener("click", function (event) {

            event.preventDefault();

            navItems.forEach(nav =>
                nav.classList.remove("active")
            );

            item.classList.add("active");

            const name = item.textContent.trim();

            if (name.includes("Command Center")) {
                showDashboard();
            }

            else if (name.includes("Incidents")) {
                showPage(incidentsPage, "Incidents");
                renderIncidents();
            }

            else if (name.includes("Operations")) {
                showPage(operationsPage, "Operations");
                renderOperations();
                updateOperationsPageStats();
            }

            else if (name.includes("Response Teams")) {
                showPage(teamsPage, "Response Teams");
                renderTeams();
                updateTeamsPageStats();
            }

            else if (name.includes("Resources")) {
                showPage(resourcesPage, "Resources");
                renderResources();
                updateResourcesPageStats();
            }

            else if (name.includes("Analytics")) {
                showPage(analyticsPage, "Analytics");
                updateAnalytics();
            }

            else if (name.includes("Settings")) {
                openSettings();
            }
        });
    });

    /* =========================================================
       MOBILE NAVIGATION
    ========================================================= */

    const sidebar = document.getElementById("sidebar");
    const sidebarScrim = document.getElementById("sidebarScrim");
    const sidebarToggle = document.getElementById("sidebarToggle");
    const sidebarClose = document.getElementById("sidebarClose");

    function setSidebarOpen(open) {
        if (!sidebar) return;

        sidebar.classList.toggle("open", open);
        sidebarScrim?.classList.toggle("show", open);
        document.body.classList.toggle("nav-open", open);
    }

    sidebarToggle?.addEventListener("click", () => setSidebarOpen(true));
    sidebarClose?.addEventListener("click", () => setSidebarOpen(false));
    sidebarScrim?.addEventListener("click", () => setSidebarOpen(false));

    navItems.forEach(item => {
        item.addEventListener("click", () => {
            if (window.innerWidth <= 1024) {
                setSidebarOpen(false);
            }
        });
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 1024) {
            setSidebarOpen(false);
        }
    });

    /* =========================================================
       TOP BAR CLOCK
    ========================================================= */

    const topbarClock = document.getElementById("topbarClock");

    function updateClock() {
        if (!topbarClock) return;
        topbarClock.textContent = new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });
    }

    updateClock();
    setInterval(updateClock, 30000);

    /* =========================================================
       QUICK ACTIONS
    ========================================================= */

    document.querySelectorAll("[data-goto]").forEach(button => {
        button.addEventListener("click", () => {
            goToPage(button.dataset.goto);
        });
    });

    /* =========================================================
       FIND NAV ITEM
    ========================================================= */

    function goToPage(name) {

        const item = [...navItems].find(nav =>
            nav.textContent.includes(name)
        );

        if (item) {
            item.click();
        }
    }

    /* =========================================================
       VIEW INCIDENTS
    ========================================================= */

    document
        .querySelector(".emergency-alert button")
        ?.addEventListener("click", function () {

            goToPage("Incidents");

        });

    document
        .querySelector(".view-all")
        ?.addEventListener("click", function () {

            goToPage("Incidents");

        });

    /* =========================================================
       INCIDENT FORM
    ========================================================= */

    const incidentFormPanel =
        document.getElementById("incidentFormPanel");

    const incidentForm =
        document.getElementById("incidentForm");

    const reportIncidentButton =
        document.querySelector("#incidentsPage .primary-btn");

    const closeIncidentForm =
        document.getElementById("closeIncidentForm");

    const cancelIncident =
        document.getElementById("cancelIncident");

    function openIncidentForm() {

        if (!incidentFormPanel) return;

        incidentFormPanel.classList.add("open");

        incidentFormPanel.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }

    function closeIncident() {

        if (incidentFormPanel) {
            incidentFormPanel.classList.remove("open");
        }

        if (incidentForm) {
            incidentForm.reset();
        }
    }

    reportIncidentButton?.addEventListener(
        "click",
        openIncidentForm
    );

    closeIncidentForm?.addEventListener(
        "click",
        closeIncident
    );

    cancelIncident?.addEventListener(
        "click",
        closeIncident
    );

    /* =========================================================
       CREATE INCIDENT
    ========================================================= */

    incidentForm?.addEventListener("submit", async function (event) {
        event.preventDefault();

        const token = getAdminToken();
        if (!token) {
            alert("Please login before creating an incident.");
            window.location.href = "../public/login.html";
            return;
        }

        const typeMap = {
            "Flood": "FLOOD",
            "Fire": "FIRE",
            "Road Accident": "ACCIDENT",
            "Landslide": "LANDSLIDE",
            "Earthquake": "EARTHQUAKE",
            "Building Collapse": "OTHER",
            "Other": "OTHER"
        };

        const severityMap = {
            "Critical": "CRITICAL",
            "High": "HIGH",
            "Medium": "MEDIUM",
            "Low": "LOW"
        };

        const frontendType = document.getElementById("incidentType")?.value || "";
        const frontendSeverity = document.getElementById("incidentSeverity")?.value || "Medium";
        const locationText = document.getElementById("incidentLocation")?.value.trim() || "";

        let latitude = null;
        let longitude = null;
        let locationName = locationText;

        const coordinateMatch = locationText.match(/^(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)$/);
        if (coordinateMatch) {
            latitude = parseFloat(coordinateMatch[1]);
            longitude = parseFloat(coordinateMatch[2]);
            locationName = "Current location";
        }

        const reportData = {
            title: document.getElementById("incidentTitle")?.value.trim() || ((frontendType || "Emergency") + " Incident"),
            description: document.getElementById("incidentDescription")?.value.trim() || "",
            incident_type: typeMap[frontendType] || "OTHER",
            severity: severityMap[frontendSeverity] || "MEDIUM",
            latitude: latitude,
            longitude: longitude,
            location_name: locationName,
            people_affected: Number(document.getElementById("peopleAffected")?.value || 0)
        };

        try {
            const response = await fetch(`${API_BASE_URL}/incidents`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(reportData)
            });

            const data = await response.json();

            if (response.status === 401) {
                localStorage.removeItem("nexus_token");
                sessionStorage.removeItem("nexus_token");
                localStorage.removeItem("nexus_user");
                alert("Your session has expired. Please login again.");
                window.location.href = "../public/login.html";
                return;
            }

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Failed to create incident.");
            }

            closeIncident();
            await renderIncidents();
            await updateDashboardStats();
            showPage(incidentsPage, "Incidents");
            goToPage("Incidents");
        } catch (error) {
            console.error("Create incident error:", error);
            alert(error.message || "Unable to create incident.");
        }
    });

    /* =========================================================
       RENDER INCIDENTS
    ========================================================= */

    async function renderIncidents() {
        const table =
            document.querySelector(".incident-table");

        if (!table) return;

        const incidents = await fetchIncidentsFromBackend();
        const header = table.querySelector(".table-header");

        table.innerHTML = "";

        if (header) {
            table.appendChild(header);
        }

        if (!incidents.length) {
            const empty = document.createElement("div");
            empty.className = "empty-state";
            empty.textContent = "No incidents have been reported yet.";
            table.appendChild(empty);
            setupIncidentFilters();
            return;
        }

        const typeLabels = {
            "FIRE": "Fire",
            "FLOOD": "Flood",
            "EARTHQUAKE": "Earthquake",
            "ACCIDENT": "Road Accident",
            "LANDSLIDE": "Landslide",
            "MEDICAL": "Medical",
            "SECURITY": "Security",
            "OTHER": "Other"
        };

        const allIncidents = [...incidents].sort(
            (first, second) =>
                new Date(second.reported_at || 0) -
                new Date(first.reported_at || 0)
        );

        allIncidents.forEach(incident => {
            const row = document.createElement("div");
            row.className = "table-row";

            const location =
                incident.location_name ||
                (
                    incident.latitude && incident.longitude
                        ? `${incident.latitude}, ${incident.longitude}`
                        : "Not provided"
                );

            const statusClass = String(incident.status || "")
                .toLowerCase()
                .replaceAll("_", "-");

            row.innerHTML = `
                <strong>${escapeHTML(incident.title)}</strong>
                <span>${escapeHTML(location)}</span>
                <span>${escapeHTML(typeLabels[incident.incident_type] || incident.incident_type || "Other")}</span>
                <b class="${severityClass(incident.severity)}">
                    ${escapeHTML(incident.severity || "Unknown")}
                </b>
                <span class="status-pill ${escapeHTML(statusClass)}">
                    ${escapeHTML(String(incident.status || "Unknown").replaceAll("_", " "))}
                </span>
                <span>${escapeHTML(formatTime(incident.reported_at))}</span>
                <div class="row-actions">
                    <button class="row-action view-incident" type="button">View</button>
                </div>
            `;

            row
                .querySelector(".view-incident")
                ?.addEventListener("click", () => openIncidentDetails(incident));

            table.appendChild(row);
        });

        setupIncidentFilters();
    }

    function openIncidentDetails(incident) {
        const transitions = {
            REPORTED: ["VERIFIED", "FALSE_ALARM"],
            VERIFIED: ["DISPATCHED", "FALSE_ALARM"],
            DISPATCHED: ["IN_PROGRESS", "FALSE_ALARM"],
            IN_PROGRESS: ["RESOLVED"],
            RESOLVED: ["CLOSED"],
            CLOSED: [],
            FALSE_ALARM: []
        };

        const currentStatus = String(incident.status || "").toUpperCase();
        const nextStatuses = transitions[currentStatus] || [];
        const statusControl = nextStatuses.length
            ? `
                <div class="form-group">
                    <label for="incidentStatusUpdate">Next Status</label>
                    <select id="incidentStatusUpdate">
                        ${nextStatuses.map(status => `<option value="${status}">${status.replaceAll("_", " ")}</option>`).join("")}
                    </select>
                </div>
                <div class="form-actions">
                    <button class="primary-btn" id="updateIncidentStatus" type="button">Update Status</button>
                </div>
            `
            : '<p class="muted">No further status changes are available for this incident.</p>';

        openActionPanel(
            `Incident #${incident.id}`,
            `
            <div class="team-detail-view">
                <h2>${escapeHTML(incident.title)}</h2>
                <p>${escapeHTML(incident.description || "No description provided.")}</p>
                <hr>
                <p><strong>Type:</strong> ${escapeHTML(incident.incident_type || "Unknown")}</p>
                <p><strong>Severity:</strong> ${escapeHTML(incident.severity || "Unknown")}</p>
                <p><strong>Status:</strong> ${escapeHTML(currentStatus.replaceAll("_", " "))}</p>
                <p><strong>Location:</strong> ${escapeHTML(incident.location_name || (incident.latitude && incident.longitude ? `${incident.latitude}, ${incident.longitude}` : "Not provided"))}</p>
                <p><strong>People affected:</strong> ${escapeHTML(incident.people_affected ?? 0)}</p>
                <p><strong>Reported:</strong> ${escapeHTML(incident.reported_at || "Unknown")}</p>
                ${statusControl}
            </div>
            `
        );

        const panel = document.getElementById("nexusActionPanel");
        panel
            ?.querySelector("#updateIncidentStatus")
            ?.addEventListener("click", async () => {
                const newStatus = panel.querySelector("#incidentStatusUpdate")?.value;
                if (!newStatus) return;

                try {
                    await updateIncidentStatusOnBackend(incident.id, newStatus);
                    closeActionPanel();
                    await renderIncidents();
                    await updateDashboardStats();
                } catch (error) {
                    console.error("Update incident status error:", error);
                    alert(error.message || "Unable to update incident status.");
                }
            });
    }

    async function updateIncidentStatusOnBackend(incidentId, status) {
        const token = getAdminToken();
        if (!token) throw new Error("Authentication required");

        const response = await fetch(`${API_BASE_URL}/incidents/${incidentId}/status`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ status })
        });

        const data = await response.json();
        if (response.status === 401) {
            throw new Error("Your session has expired. Please login again.");
        }
        if (!response.ok || !data.success) {
            throw new Error(data.message || "Failed to update incident status.");
        }
        return data;
    }

    /* =========================================================
       INCIDENT FILTERS
    ========================================================= */

    function setupIncidentFilters() {

        const search =
            document.querySelector(
                "#incidentsPage input[placeholder*='Search']"
            );

        const severity =
            document.querySelector(
                "#incidentsPage select:nth-of-type(1)"
            );

        const region =
            document.querySelector(
                "#incidentsPage select:nth-of-type(2)"
            );

        if (!search) return;

        const filter = () => {

            const rows =
                document.querySelectorAll(
                    ".incident-table .table-row"
                );

            const searchValue =
                search.value.toLowerCase();

            const severityValue =
                severity?.value || "All Severity";

            const regionValue =
                region?.value || "All Regions";

            rows.forEach(row => {

                const text =
                    row.textContent.toLowerCase();

                const matchesSearch =
                    !searchValue ||
                    text.includes(searchValue);

                const matchesSeverity =
                    severityValue === "All Severity" ||
                    text.includes(
                        severityValue.toLowerCase()
                    );

                const matchesRegion =
                    regionValue === "All Regions" ||
                    text.includes(
                        regionValue.toLowerCase()
                    );

                row.style.display =
                    matchesSearch &&
                    matchesSeverity &&
                    matchesRegion
                        ? ""
                        : "none";
            });
        };

        search.oninput = filter;

        if (severity) severity.onchange = filter;
        if (region) region.onchange = filter;
    }

    /* =========================================================
       OPERATION
    ========================================================= */

    const createOperationButton =
        document.querySelector(
            "#operationsPage .primary-btn"
        );

    createOperationButton?.addEventListener(
        "click",
        function () {

            openActionPanel(
                "Create Response Operation",
                createOperationForm()
            );

        }
    );

    function createOperationForm() {

        return `
            <form id="operationActionForm">

                <div class="form-grid">

                    <div class="form-group">
                        <label>Operation Name</label>
                        <input
                            type="text"
                            id="operationName"
                            placeholder="Operation Delta"
                            required
                        >
                    </div>

                    <div class="form-group">
                        <label>Emergency Type</label>
                        <select id="operationType" required>
                            <option value="">Select type</option>
                            <option>Flood Response</option>
                            <option>Fire Response</option>
                            <option>Road Accident</option>
                            <option>Landslide Response</option>
                            <option>Search & Rescue</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label>Location</label>
                        <input
                            type="text"
                            id="operationLocation"
                            placeholder="Bahir Dar, Amhara"
                            required
                        >
                    </div>

                    <div class="form-group">
                        <label>Priority</label>
                        <select id="operationPriority">
                            <option>Critical</option>
                            <option>High</option>
                            <option>Medium</option>
                            <option>Low</option>
                        </select>
                    </div>

                </div>

                <div class="form-actions">
                    <button
                        type="button"
                        class="secondary-btn"
                        id="closeActionForm"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        class="primary-btn"
                    >
                        Create Operation
                    </button>
                </div>

            </form>
        `;
    }

    /* =========================================================
       TEAM
    ========================================================= */

    const registerTeamButton =
        document.querySelector(
            "#teamsPage .primary-btn"
        );

    registerTeamButton?.addEventListener(
        "click",
        function () {

            openActionPanel(
                "Register Response Team",
                createTeamForm()
            );

        }
    );

    function createTeamForm() {

        return `
            <form id="teamActionForm">

                <div class="form-grid">

                    <div class="form-group">
                        <label>Team Name</label>
                        <input
                            type="text"
                            id="teamName"
                            placeholder="Emergency Rescue Unit"
                            required
                        >
                    </div>

                    <div class="form-group">
                        <label>Team Type</label>
                        <select id="teamType" required>
                            <option value="">Select type</option>
                            <option>Urban Search & Rescue</option>
                            <option>Medical Response</option>
                            <option>Fire & Safety</option>
                            <option>Water Rescue</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label>Base Location</label>
                        <input
                            type="text"
                            id="teamLocation"
                            placeholder="Addis Ababa"
                            required
                        >
                    </div>

                    <div class="form-group">
                        <label>Number of Members</label>
                        <input
                            type="number"
                            id="teamMembers"
                            min="1"
                            value="5"
                            required
                        >
                    </div>

                    <div class="form-group">
                        <label>Vehicles / Equipment</label>
                        <input
                            type="number"
                            id="teamVehicles"
                            min="0"
                            value="1"
                        >
                    </div>

                </div>

                <div class="form-actions">

                    <button
                        type="button"
                        class="secondary-btn"
                        id="closeActionForm"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        class="primary-btn"
                    >
                        Register Team
                    </button>

                </div>

            </form>
        `;
    }

    /* =========================================================
       RESOURCE
    ========================================================= */

    const addResourceButton =
        document.querySelector(
            "#resourcesPage .primary-btn"
        );

    addResourceButton?.addEventListener(
        "click",
        function () {

            openActionPanel(
                "Add Emergency Resource",
                createResourceForm()
            );

        }
    );

    function createResourceForm() {

        return `
            <form id="resourceActionForm">

                <div class="form-grid">

                    <div class="form-group">
                        <label>Resource Name</label>
                        <input
                            type="text"
                            id="resourceName"
                            placeholder="Ambulance"
                            required
                        >
                    </div>

                    <div class="form-group">
                        <label>Resource Type</label>
                        <select id="resourceType">
                            <option>Medical</option>
                            <option>Transport</option>
                            <option>Fire & Rescue</option>
                            <option>Shelter</option>
                            <option>Relief Supply</option>
                            <option>Communication</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label>Quantity</label>
                        <input
                            type="number"
                            id="resourceQuantity"
                            min="1"
                            required
                        >
                    </div>

                    <div class="form-group">
                        <label>Location</label>
                        <input
                            type="text"
                            id="resourceLocation"
                            placeholder="Addis Ababa"
                            required
                        >
                    </div>

                </div>

                <div class="form-actions">

                    <button
                        type="button"
                        class="secondary-btn"
                        id="closeActionForm"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        class="primary-btn"
                    >
                        Add Resource
                    </button>

                </div>

            </form>
        `;
    }

    /* =========================================================
       GENERIC ACTION PANEL
    ========================================================= */

    function openActionPanel(title, content) {

        closeActionPanel();

        const panel =
            document.createElement("div");

        panel.className =
            "nexus-action-panel open";

        panel.id = "nexusActionPanel";

        panel.innerHTML = `
            <div class="nexus-action-inner">

                <div class="form-panel-header">

                    <div>
                        <h2>${title}</h2>
                        <p>
                            NEXUS Emergency Operations Network
                        </p>
                    </div>

                    <button
                        type="button"
                        class="form-close-btn"
                        id="closeActionPanel"
                    >
                        ×
                    </button>

                </div>

                ${content}

            </div>
        `;

        document.body.appendChild(panel);

        panel
            .querySelector("#closeActionPanel")
            ?.addEventListener(
                "click",
                closeActionPanel
            );

        panel
            .querySelector("#closeActionForm")
            ?.addEventListener(
                "click",
                closeActionPanel
            );

        setupActionForm(panel);
    }

    function closeActionPanel() {

        const panel =
            document.getElementById(
                "nexusActionPanel"
            );

        if (panel) {
            panel.remove();
        }
    }

    /* =========================================================
       ACTION FORM SUBMISSION
    ========================================================= */

    function setupActionForm(panel) {

        const operationForm =
            panel.querySelector(
                "#operationActionForm"
            );

        const teamForm =
            panel.querySelector(
                "#teamActionForm"
            );

        const resourceForm =
            panel.querySelector(
                "#resourceActionForm"
            );

        /* OPERATION */

        /* OPERATION */

        operationForm?.addEventListener("submit", async function (event) {
            event.preventDefault();

            const token = getAdminToken();
            if (!token) {
                alert("Please login before creating an operation.");
                window.location.href = "../public/login.html";
                return;
            }

            const priorityMap = { "Critical": "CRITICAL", "High": "HIGH", "Medium": "MEDIUM", "Low": "LOW" };
            const operationData = {
                name: document.getElementById("operationName")?.value.trim(),
                operation_type: document.getElementById("operationType")?.value,
                location_name: document.getElementById("operationLocation")?.value.trim() || null,
                priority: priorityMap[document.getElementById("operationPriority")?.value] || "MEDIUM",
                status: "ACTIVE"
            };

            if (!operationData.name || !operationData.operation_type) {
                alert("Operation name and emergency type are required.");
                return;
            }

            try {
                await createOperationOnBackend(operationData);
                closeActionPanel();
                await renderOperations();
                goToPage("Operations");
            } catch (error) {
                console.error("Create operation error:", error);
                alert(error.message || "Unable to create operation.");
            }
        });

        /* TEAM */

        /* TEAM */

        teamForm?.addEventListener("submit", async function (event) {
            event.preventDefault();

            const token = getAdminToken();
            if (!token) {
                alert("Please login before registering a response team.");
                window.location.href = "../public/login.html";
                return;
            }

            const typeMap = {
                "Urban Search & Rescue": "RESCUE",
                "Medical Response": "MEDICAL",
                "Fire & Safety": "FIRE",
                "Water Rescue": "RESCUE"
            };

            const frontendType = document.getElementById("teamType")?.value || "";
            const teamData = {
                name: document.getElementById("teamName")?.value.trim(),
                team_type: typeMap[frontendType] || "OTHER",
                location_name: document.getElementById("teamLocation")?.value.trim() || null
            };

            if (!teamData.name || !teamData.team_type) {
                alert("Team name and team type are required.");
                return;
            }

            try {
                await createTeamOnBackend(teamData);
                closeActionPanel();
                await renderTeams();
                goToPage("Response Teams");
            } catch (error) {
                console.error("Create team error:", error);
                alert(error.message || "Unable to register response team.");
            }
        });

        /* RESOURCE */

        /* RESOURCE */

        resourceForm?.addEventListener("submit", async function (event) {
            event.preventDefault();

            const token = getAdminToken();
            if (!token) {
                alert("Please login before adding a resource.");
                window.location.href = "../public/login.html";
                return;
            }

            const typeMap = {
                "Medical": "MEDICAL",
                "Transport": "VEHICLE",
                "Fire & Rescue": "EQUIPMENT",
                "Shelter": "OTHER",
                "Relief Supply": "SUPPLIES",
                "Communication": "OTHER"
            };

            const frontendType = document.getElementById("resourceType")?.value || "";
            const resourceData = {
                name: document.getElementById("resourceName")?.value.trim(),
                resource_type: typeMap[frontendType] || "OTHER",
                quantity: Number(document.getElementById("resourceQuantity")?.value || 0)
            };

            if (!resourceData.name || !resourceData.resource_type || !Number.isInteger(resourceData.quantity) || resourceData.quantity < 0) {
                alert("Resource name, type, and a valid non-negative quantity are required.");
                return;
            }

            try {
                await createResourceOnBackend(resourceData);
                closeActionPanel();
                await renderResources();
                goToPage("Resources");
            } catch (error) {
                console.error("Create resource error:", error);
                alert(error.message || "Unable to add resource.");
            }
        });
    }

    /* =========================================================
       RENDER OPERATIONS
    ========================================================= */

    async function renderOperations() {
        const list = document.querySelector(".operations-list");
        if (!list) return;

        list.innerHTML = '<div class="operation-card"><p>Loading operations...</p></div>';

        const token = getAdminToken();
        if (!token) {
            list.innerHTML = '<div class="operation-card"><p>Please login to view operations.</p></div>';
            return;
        }

        let operations = [];
        try {
            operations = await fetchOperationsFromBackend();
        } catch (error) {
            console.error("Render operations error:", error);
            list.innerHTML = '<div class="operation-card"><p>Unable to load operations.</p></div>';
            return;
        }

        list.innerHTML = "";

        if (!operations.length) {
            list.innerHTML = '<div class="operation-card"><p>No operations found.</p></div>';
            return;
        }

        operations.forEach(operation => {
            const card = document.createElement("div");
            card.className = "operation-card";
            card.dataset.id = operation.id;

            card.innerHTML = `
                <div class="operation-card-header">
                    <div>
                        <span class="operation-code">${escapeHTML(operation.id)}</span>
                        <h2>${escapeHTML(operation.name)}</h2>
                    </div>
                    <span class="operation-badge ${String(operation.status).toLowerCase() === "active" ? "active-badge" : "standby-badge"}">${escapeHTML(operation.status)}</span>
                </div>
                <p>${escapeHTML(operation.operation_type)}</p>
                <div class="operation-details">
                    <span>Location: ${escapeHTML(operation.location_name || "Not provided")}</span>
                    <span>Priority: ${escapeHTML(operation.priority)}</span>
                </div>
                <div class="operation-actions" style="margin-top:12px;display:flex;gap:8px;align-items:center;">
                    <select class="operation-status-select" style="padding:6px;border-radius:6px;">
                        <option value="ACTIVE" ${operation.status === "ACTIVE" ? "selected" : ""}>Active</option>
                        <option value="STANDBY" ${operation.status === "STANDBY" ? "selected" : ""}>Standby</option>
                        <option value="COMPLETED" ${operation.status === "COMPLETED" ? "selected" : ""}>Completed</option>
                        <option value="CANCELLED" ${operation.status === "CANCELLED" ? "selected" : ""}>Cancelled</option>
                    </select>
                    <button class="team-btn update-operation-status" type="button">Update Status</button>
                    <button class="team-btn delete-operation" type="button">Delete</button>
                </div>
            `;

            list.appendChild(card);

            card.querySelector(".update-operation-status")?.addEventListener("click", async () => {
                const newStatus = card.querySelector(".operation-status-select")?.value;
                if (!newStatus) return;
                try {
                    await updateOperationOnBackend(operation.id, { status: newStatus });
                    await renderOperations();
                } catch (error) {
                    console.error("Update operation error:", error);
                    alert(error.message || "Unable to update operation.");
                }
            });

            card.querySelector(".delete-operation")?.addEventListener("click", async () => {
                if (!confirm("Are you sure you want to delete this operation?")) return;
                try {
                    await deleteOperationOnBackend(operation.id);
                    await renderOperations();
                } catch (error) {
                    console.error("Delete operation error:", error);
                    alert(error.message || "Unable to delete operation.");
                }
            });
        });
    }

    /* =========================================================
       RENDER TEAMS
    ========================================================= */

    async function renderTeams() {
        const grid = document.querySelector("#teamsPage .teams-grid");
        if (!grid) return;

        grid.innerHTML = '<div class="team-card"><p>Loading response teams...</p></div>';

        const token = getAdminToken();
        if (!token) {
            grid.innerHTML = '<div class="team-card"><p>Please login to view response teams.</p></div>';
            return;
        }

        let teams = [];
        try {
            teams = await fetchTeamsFromBackend();
        } catch (error) {
            console.error("Render teams error:", error);
            grid.innerHTML = '<div class="team-card"><p>Unable to load response teams.</p></div>';
            return;
        }

        grid.innerHTML = "";

        if (!teams.length) {
            grid.innerHTML = '<div class="team-card"><p>No response teams found.</p></div>';
            return;
        }

        const typeLabels = {
            "FIRE": "Fire & Safety",
            "MEDICAL": "Medical Response",
            "POLICE": "Police",
            "RESCUE": "Urban Search & Rescue",
            "DISASTER": "Disaster Response",
            "OTHER": "Other"
        };

        teams.forEach(team => {
            const card = document.createElement("div");
            card.className = "team-card";
            card.dataset.id = team.id;

            const statusClass = String(team.status || "").toLowerCase() === "available" ? "available" : "deployed";

            card.innerHTML = `
                <div class="team-header">
                    <div class="team-avatar">${escapeHTML(String(team.name || "RT").substring(0, 2).toUpperCase())}</div>
                    <span class="team-status ${statusClass}">${escapeHTML(team.status || "UNKNOWN")}</span>
                </div>
                <h2>${escapeHTML(team.name)}</h2>
                <p>${escapeHTML(typeLabels[team.team_type] || team.team_type || "Response Team")}</p>
                <div class="team-info">
                    <span>Base: ${escapeHTML(team.location_name || "Not provided")}</span>
                </div>
                <div class="team-actions" style="margin-top:12px;display:flex;gap:8px;align-items:center;">
                    <select class="team-status-select" data-team-id="${team.id}" style="padding:6px;border-radius:6px;">
                        <option value="AVAILABLE" ${team.status === "AVAILABLE" ? "selected" : ""}>Available</option>
                        <option value="BUSY" ${team.status === "BUSY" ? "selected" : ""}>Busy</option>
                        <option value="OFFLINE" ${team.status === "OFFLINE" ? "selected" : ""}>Offline</option>
                    </select>
                    <button class="team-btn update-team-status" data-team-id="${team.id}" type="button">Update Status</button>
                    <button class="team-btn view-team" data-team-id="${team.id}" type="button">View Team</button>\n                    <button class="team-btn manage-team-members" data-team-id="${team.id}" type="button">Manage Members</button>
                </div>
            `;

            grid.appendChild(card);

            card.querySelector(".update-team-status")?.addEventListener("click", async () => {
                const select = card.querySelector(".team-status-select");
                const newStatus = select?.value;
                if (!newStatus) return;

                try {
                    await updateTeamStatusOnBackend(team.id, newStatus);
                    await renderTeams();
                } catch (error) {
                    console.error("Update team status error:", error);
                    alert(error.message || "Unable to update team status.");
                }
            });

            card.querySelector(".view-team")?.addEventListener("click", () => {
                openTeamDetails(team);
            });

            card.querySelector(".manage-team-members")?.addEventListener("click", async () => {
                await openTeamMembersPanel(team);
            });
        });
    }

    /* =========================================================
       TEAM DETAILS
    ========================================================= */

    function openTeamDetails(team) {
        openActionPanel(
            "Response Team Details",
            `
            <div class="team-detail-view">
                <h2>${escapeHTML(team.name)}</h2>
                <p>${escapeHTML(team.team_type || "Response Team")}</p>
                <hr>
                <p><strong>Base:</strong> ${escapeHTML(team.location_name || "Not provided")}</p>
                <p><strong>Status:</strong> ${escapeHTML(team.status || "Unknown")}</p>
                <p><strong>Created:</strong> ${escapeHTML(team.created_at || "Unknown")}</p>
                <p class="muted">Team members and equipment are managed through the backend team-member endpoints.</p>
            </div>
            `
        );
    }
    async function openTeamMembersPanel(team) {
        const members = await fetchTeamMembersFromBackend(team.id);
        const users = await fetchUsersFromBackend();
        const responders = users.filter(user => user.role === "RESPONDER" && user.status === "ACTIVE");

        const memberRows = members.length
            ? members.map(member => `<div style="display:flex;justify-content:space-between;gap:8px;padding:8px 0;border-bottom:1px solid #e5e7eb;"><span>${escapeHTML(member.full_name || "Unknown")} (${escapeHTML(member.email || "")})</span><button class="team-btn remove-team-member" data-member-id="${member.id}" type="button">Remove</button></div>`).join("")
            : "<p>No team members assigned.</p>";

        const responderOptions = responders.length
            ? responders.map(user => `<option value="${user.id}">${escapeHTML(user.full_name)} (${escapeHTML(user.email)})</option>`).join("")
            : '<option value="">No active responders available</option>';

        openActionPanel(
            "Team Members",
            `
            <div class="team-detail-view">
                <h2>${escapeHTML(team.name)}</h2>
                <div style="margin:12px 0;">${memberRows}</div>
                <hr>
                <form id="addTeamMemberForm" style="margin-top:12px;">
                    <div class="form-group">
                        <label>Add Responder</label>
                        <select id="teamMemberUser" style="width:100%;padding:8px;border-radius:6px;">${responderOptions}</select>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="primary-btn">Add Member</button>
                    </div>
                </form>
            </div>
            `
        );

        const panel = document.getElementById("nexusActionPanel");
        panel?.querySelectorAll(".remove-team-member").forEach(button => {
            button.addEventListener("click", async () => {
                try {
                    await removeTeamMemberOnBackend(button.dataset.memberId);
                    await openTeamMembersPanel(team);
                } catch (error) {
                    console.error("Remove team member error:", error);
                    alert(error.message || "Unable to remove team member.");
                }
            });
        });

        const form = panel?.querySelector("#addTeamMemberForm");
        form?.addEventListener("submit", async (event) => {
            event.preventDefault();
            const userId = panel?.querySelector("#teamMemberUser")?.value;
            if (!userId) {
                alert("Please select a responder.");
                return;
            }
            try {
                await addTeamMemberOnBackend(team.id, Number(userId));
                await openTeamMembersPanel(team);
            } catch (error) {
                console.error("Add team member error:", error);
                alert(error.message || "Unable to add team member.");
            }
        });
    }

    /* =========================================================
       RENDER RESOURCES
    ========================================================= */

    async function renderResources() {
        const grid = document.querySelector("#resourcesPage .resources-grid");
        if (!grid) return;

        grid.innerHTML = '<div class="resource-card"><p>Loading resources...</p></div>';

        const token = getAdminToken();
        if (!token) {
            grid.innerHTML = '<div class="resource-card"><p>Please login to view resources.</p></div>';
            return;
        }

        let resources = [];
        try {
            resources = await fetchResourcesFromBackend();
        } catch (error) {
            console.error("Render resources error:", error);
            grid.innerHTML = '<div class="resource-card"><p>Unable to load resources.</p></div>';
            return;
        }

        grid.innerHTML = "";

        if (!resources.length) {
            grid.innerHTML = '<div class="resource-card"><p>No resources found.</p></div>';
            return;
        }

        const statusLabels = {
            "AVAILABLE": "Available",
            "IN_USE": "In Use",
            "MAINTENANCE": "Maintenance",
            "UNAVAILABLE": "Unavailable"
        };

        resources.forEach(resource => {
            const card = document.createElement("div");
            card.className = "resource-card";
            card.dataset.id = resource.id;

            card.innerHTML = `
                <div class="resource-card-header">
                    <h2>${escapeHTML(resource.name)}</h2>
                    <span class="status-badge ${String(resource.status || "").toLowerCase()}">${escapeHTML(statusLabels[resource.status] || resource.status || "Unknown")}</span>
                </div>
                <p>${escapeHTML(resource.resource_type || "Resource")}</p>
                <div class="resource-details">
                    <strong>${escapeHTML(resource.available_quantity ?? 0)}</strong>
                    <span>Available of ${escapeHTML(resource.quantity ?? 0)}</span>
                </div>
                <div class="resource-actions" style="margin-top:12px;display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
                    <select class="resource-status-select" data-resource-id="${resource.id}" style="padding:6px;border-radius:6px;">
                        <option value="AVAILABLE" ${resource.status === "AVAILABLE" ? "selected" : ""}>Available</option>
                        <option value="MAINTENANCE" ${resource.status === "MAINTENANCE" ? "selected" : ""}>Maintenance</option>
                        <option value="UNAVAILABLE" ${resource.status === "UNAVAILABLE" ? "selected" : ""}>Unavailable</option>
                    </select>
                    <button class="team-btn update-resource-status" data-resource-id="${resource.id}" type="button">Update Status</button>
                    <button class="team-btn delete-resource" data-resource-id="${resource.id}" type="button">Delete</button>\n                    <button class="team-btn assign-resource" data-resource-id="${resource.id}" type="button">Assign</button>\n                    <button class="team-btn return-resource-panel" type="button">Return Assignment</button>
                </div>
            `;

            grid.appendChild(card);

            card.querySelector(".update-resource-status")?.addEventListener("click", async () => {
                const select = card.querySelector(".resource-status-select");
                const newStatus = select?.value;
                if (!newStatus) return;

                try {
                    await updateResourceOnBackend(resource.id, {
                        name: resource.name,
                        resource_type: resource.resource_type,
                        quantity: Number(resource.quantity || 0),
                        status: newStatus
                    });
                    await renderResources();
                } catch (error) {
                    console.error("Update resource status error:", error);
                    alert(error.message || "Unable to update resource status.");
                }
            });

            card.querySelector(".delete-resource")?.addEventListener("click", async () => {
                const confirmed = confirm("Are you sure you want to delete this resource?");
                if (!confirmed) return;

                try {
                    await deleteResourceOnBackend(resource.id);
                    await renderResources();
                } catch (error) {
                    console.error("Delete resource error:", error);
                    alert(error.message || "Unable to delete resource.");
                }
            });
            card.querySelector(".assign-resource")?.addEventListener("click", async () => {
                await openAssignResourcePanel(resource);
            });

            card.querySelector(".return-resource-panel")?.addEventListener("click", () => {
                openReturnResourcePanel();
            });
        });
    }

    /* =========================================================
       SETTINGS
    ========================================================= */
function openSettings() {

    hideEverything();

    if (settingsPage) {
        settingsPage.style.display = "block";
    }

    updatePageTitle(
        pageInfo["Settings"].title,
        pageInfo["Settings"].subtitle
    );

    loadSettings();
}
    async function fetchTeamMembersFromBackend(teamId) {
        const token = getAdminToken();
        if (!token) return [];
        try {
            const response = await fetch(`${API_BASE_URL}/teams/${teamId}/members`, {
                method: "GET",
                headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }
            });
            if (response.status === 401) return [];
            const data = await response.json();
            if (!response.ok || !data.success) return [];
            return data.members || [];
        } catch (error) {
            console.error("Team members API error:", error);
            return [];
        }
    }

    async function fetchUsersFromBackend() {
        const token = getAdminToken();
        if (!token) return [];
        try {
            const response = await fetch(`${API_BASE_URL}/users`, {
                method: "GET",
                headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }
            });
            if (response.status === 401) return [];
            const data = await response.json();
            if (!response.ok || !data.success) return [];
            return data.users || [];
        } catch (error) {
            console.error("Users API error:", error);
            return [];
        }
    }

    async function addTeamMemberOnBackend(teamId, userId) {
        const token = getAdminToken();
        if (!token) throw new Error("Authentication required");
        const response = await fetch(`${API_BASE_URL}/teams/members`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ team_id: teamId, user_id: userId })
        });
        const data = await response.json();
        if (response.status === 401) throw new Error("Your session has expired. Please login again.");
        if (!response.ok || !data.success) throw new Error(data.message || "Failed to add team member.");
        return data;
    }

    async function removeTeamMemberOnBackend(memberId) {
        const token = getAdminToken();
        if (!token) throw new Error("Authentication required");
        const response = await fetch(`${API_BASE_URL}/teams/members/${memberId}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }
        });
        const data = await response.json();
        if (response.status === 401) throw new Error("Your session has expired. Please login again.");
        if (!response.ok || !data.success) throw new Error(data.message || "Failed to remove team member.");
        return data;
    }
    async function fetchResourcesFromBackend() {
        const token = getAdminToken();
        if (!token) return [];

        try {
            const response = await fetch(`${API_BASE_URL}/resources`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (response.status === 401) {
                console.warn("Admin session expired.");
                return [];
            }

            const data = await response.json();
            if (!response.ok || !data.success) {
                console.error("Failed to load resources:", data);
                return [];
            }

            return data.resources || [];
        } catch (error) {
            console.error("Dashboard resource API error:", error);
            return [];
        }
    }

    async function createResourceOnBackend(resourceData) {
        const token = getAdminToken();
        if (!token) throw new Error("Authentication required");

        const response = await fetch(`${API_BASE_URL}/resources`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(resourceData)
        });

        const data = await response.json();
        if (response.status === 401) {
            localStorage.removeItem("nexus_token");
            sessionStorage.removeItem("nexus_token");
            localStorage.removeItem("nexus_user");
            throw new Error("Your session has expired. Please login again.");
        }
        if (!response.ok || !data.success) {
            throw new Error(data.message || "Failed to create resource.");
        }
        return data;
    }

    async function updateResourceOnBackend(resourceId, resourceData) {
        const token = getAdminToken();
        if (!token) throw new Error("Authentication required");

        const response = await fetch(`${API_BASE_URL}/resources/${resourceId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(resourceData)
        });

        const data = await response.json();
        if (response.status === 401) {
            localStorage.removeItem("nexus_token");
            sessionStorage.removeItem("nexus_token");
            localStorage.removeItem("nexus_user");
            throw new Error("Your session has expired. Please login again.");
        }
        if (!response.ok || !data.success) {
            throw new Error(data.message || "Failed to update resource.");
        }
        return data;
    }

    async function deleteResourceOnBackend(resourceId) {
        const token = getAdminToken();
        if (!token) throw new Error("Authentication required");

        const response = await fetch(`${API_BASE_URL}/resources/${resourceId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        const data = await response.json();
        if (response.status === 401) {
            localStorage.removeItem("nexus_token");
            sessionStorage.removeItem("nexus_token");
            localStorage.removeItem("nexus_user");
            throw new Error("Your session has expired. Please login again.");
        }
        if (!response.ok || !data.success) {
            throw new Error(data.message || "Failed to delete resource.");
        }
        return data;
    }
function loadSettings() {

    const settings = JSON.parse(
        localStorage.getItem(STORAGE.settings) || "{}"
    );

    const notifications =
        document.getElementById("settingNotifications");

    const ai =
        document.getElementById("settingAI");

    const refresh =
        document.getElementById("settingRefresh");

    const twoFA =
        document.getElementById("setting2FA");

    const audit =
        document.getElementById("settingAudit");

    const priority =
        document.getElementById("defaultPriority");

    const region =
        document.getElementById("responseRegion");

    if (notifications)
        notifications.checked =
            settings.notifications !== false;

    if (ai)
        ai.checked =
            settings.ai !== false;

    if (refresh)
        refresh.checked =
            settings.refresh !== false;

    if (twoFA)
        twoFA.checked =
            settings.twoFA === true;

    if (audit)
        audit.checked =
            settings.audit !== false;

    if (priority)
        priority.value =
            settings.priority || "High";

    if (region)
        region.value =
            settings.region || "All Regions";
}
    async function assignResourceOnBackend(resourceId, incidentId, quantity) {
        const token = getAdminToken();
        if (!token) throw new Error("Authentication required");
        const response = await fetch(`${API_BASE_URL}/resources/assign`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ resource_id: resourceId, incident_id: incidentId, quantity })
        });
        const data = await response.json();
        if (response.status === 401) throw new Error("Your session has expired. Please login again.");
        if (!response.ok || !data.success) throw new Error(data.message || "Failed to assign resource.");
        return data;
    }

    async function returnResourceOnBackend(assignmentId) {
        const token = getAdminToken();
        if (!token) throw new Error("Authentication required");
        const response = await fetch(`${API_BASE_URL}/resources/assignments/${assignmentId}/return`, {
            method: "PATCH",
            headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }
        });
        const data = await response.json();
        if (response.status === 401) throw new Error("Your session has expired. Please login again.");
        if (!response.ok || !data.success) throw new Error(data.message || "Failed to return resource.");
        return data;
    }

    async function openAssignResourcePanel(resource) {
        const incidents = await fetchIncidentsFromBackend();
        const options = incidents.length
            ? incidents.map(incident => `<option value="${incident.id}">#${incident.id} - ${escapeHTML(incident.title)} (${escapeHTML(incident.status)})</option>`).join("")
            : '<option value="">No incidents available</option>';

        openActionPanel(
            "Assign Resource",
            `
            <form id="assignResourceForm">
                <div class="form-group">
                    <label>Resource</label>
                    <input type="text" value="${escapeHTML(resource.name)}" disabled>
                </div>
                <div class="form-group">
                    <label>Incident</label>
                    <select id="assignIncidentId" required style="width:100%;padding:8px;border-radius:6px;">${options}</select>
                </div>
                <div class="form-group">
                    <label>Quantity</label>
                    <input type="number" id="assignQuantity" min="1" max="${Number(resource.available_quantity || 0)}" value="1" required>
                </div>
                <div class="form-actions">
                    <button type="submit" class="primary-btn">Assign Resource</button>
                </div>
            </form>
            `
        );

        const panel = document.getElementById("nexusActionPanel");
        panel?.querySelector("#assignResourceForm")?.addEventListener("submit", async (event) => {
            event.preventDefault();
            const incidentId = Number(panel.querySelector("#assignIncidentId")?.value);
            const quantity = Number(panel.querySelector("#assignQuantity")?.value);
            if (!incidentId || !Number.isInteger(quantity) || quantity <= 0) {
                alert("Please select an incident and enter a valid quantity.");
                return;
            }
            if (quantity > Number(resource.available_quantity || 0)) {
                alert("Requested quantity exceeds available quantity.");
                return;
            }
            try {
                const result = await assignResourceOnBackend(resource.id, incidentId, quantity);
                alert(`Resource assigned successfully. Assignment ID: ${result.assignment?.id ?? "N/A"}`);
                closeActionPanel();
                await renderResources();
            } catch (error) {
                console.error("Assign resource error:", error);
                alert(error.message || "Unable to assign resource.");
            }
        });
    }

    function openReturnResourcePanel() {
        openActionPanel(
            "Return Resource",
            `
            <form id="returnResourceForm">
                <div class="form-group">
                    <label>Resource Assignment ID</label>
                    <input type="number" id="returnAssignmentId" min="1" required>
                </div>
                <div class="form-actions">
                    <button type="submit" class="primary-btn">Return Resource</button>
                </div>
            </form>
            `
        );

        const panel = document.getElementById("nexusActionPanel");
        panel?.querySelector("#returnResourceForm")?.addEventListener("submit", async (event) => {
            event.preventDefault();
            const assignmentId = Number(panel.querySelector("#returnAssignmentId")?.value);
            if (!Number.isInteger(assignmentId) || assignmentId <= 0) {
                alert("Please enter a valid assignment ID.");
                return;
            }
            try {
                await returnResourceOnBackend(assignmentId);
                alert("Resource returned successfully.");
                closeActionPanel();
                await renderResources();
            } catch (error) {
                console.error("Return resource error:", error);
                alert(error.message || "Unable to return resource.");
            }
        });
    }
    async function fetchOperationsFromBackend() {
        const token = getAdminToken();
        if (!token) return [];
        try {
            const response = await fetch(`${API_BASE_URL}/operations`, {
                method: "GET",
                headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }
            });
            if (response.status === 401) return [];
            const data = await response.json();
            if (!response.ok || !data.success) return [];
            return data.operations || [];
        } catch (error) {
            console.error("Dashboard operations API error:", error);
            return [];
        }
    }

    async function createOperationOnBackend(operationData) {
        const token = getAdminToken();
        if (!token) throw new Error("Authentication required");
        const response = await fetch(`${API_BASE_URL}/operations`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify(operationData)
        });
        const data = await response.json();
        if (response.status === 401) {
            localStorage.removeItem("nexus_token");
            sessionStorage.removeItem("nexus_token");
            localStorage.removeItem("nexus_user");
            throw new Error("Your session has expired. Please login again.");
        }
        if (!response.ok || !data.success) throw new Error(data.message || "Failed to create operation.");
        return data;
    }

    async function updateOperationOnBackend(operationId, operationData) {
        const token = getAdminToken();
        if (!token) throw new Error("Authentication required");
        const response = await fetch(`${API_BASE_URL}/operations/${operationId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify(operationData)
        });
        const data = await response.json();
        if (response.status === 401) throw new Error("Your session has expired. Please login again.");
        if (!response.ok || !data.success) throw new Error(data.message || "Failed to update operation.");
        return data;
    }

    async function deleteOperationOnBackend(operationId) {
        const token = getAdminToken();
        if (!token) throw new Error("Authentication required");
        const response = await fetch(`${API_BASE_URL}/operations/${operationId}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }
        });
        const data = await response.json();
        if (response.status === 401) throw new Error("Your session has expired. Please login again.");
        if (!response.ok || !data.success) throw new Error(data.message || "Failed to delete operation.");
        return data;
    }
    function createSettingsForm() {

        return `
            <form id="settingsForm">

                <div class="form-grid">

                    <div class="form-group">

                        <label>
                            Administrator Name
                        </label>

                        <input
                            type="text"
                            id="settingsName"
                            required
                        >

                    </div>

                    <div class="form-group">

                        <label>
                            Operations Region
                        </label>

                        <select id="settingsRegion">

                            <option>
                                National Operations
                            </option>

                            <option>
                                Addis Ababa
                            </option>

                            <option>
                                Oromia
                            </option>

                            <option>
                                Amhara
                            </option>

                            <option>
                                SNNPR
                            </option>

                        </select>

                    </div>

                </div>

                <div class="settings-list">

                    <label class="setting-item">

                        <div>
                            <strong>
                                Emergency Notifications
                            </strong>

                            <p>
                                Receive alerts for critical incidents.
                            </p>
                        </div>

                        <input
                            type="checkbox"
                            id="notificationsEnabled"
                        >

                    </label>

                    <label class="setting-item">

                        <div>
                            <strong>
                                Alert Sounds
                            </strong>

                            <p>
                                Enable emergency notification sounds.
                            </p>
                        </div>

                        <input
                            type="checkbox"
                            id="soundEnabled"
                        >

                    </label>

                </div>

                <div class="form-actions">

                    <button
                        type="button"
                        class="secondary-btn"
                        id="closeActionForm"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        class="primary-btn"
                    >
                        Save Settings
                    </button>

                </div>

            </form>
        `;
    }

    /* =========================================================
       NOTIFICATIONS
    ========================================================= */

    document
        .querySelector(".notification")
        ?.addEventListener(
            "click",
            async function () {
                const incidents = await fetchIncidentsFromBackend();
                const openIncidents = incidents
                    .filter(incident => !["RESOLVED", "CLOSED", "FALSE_ALARM"].includes(String(incident.status || "").toUpperCase()))
                    .sort(
                        (first, second) =>
                            new Date(second.reported_at || 0) -
                            new Date(first.reported_at || 0)
                    )
                    .slice(0, 5);

                const content = openIncidents.length
                    ? openIncidents.map(incident => `
                        <div class="setting-item">
                            <div>
                                <strong>${escapeHTML(incident.title || "Emergency incident")}</strong>
                                <p>${escapeHTML(incident.location_name || "Location not provided")} · ${escapeHTML(String(incident.status || "Unknown").replaceAll("_", " "))}</p>
                            </div>
                            <span class="status-badge ${severityClass(incident.severity)}">
                                ${escapeHTML(incident.severity || "LOW")}
                            </span>
                        </div>
                    `).join("")
                    : '<div class="empty-state">No open emergency notifications right now.</div>';

                openActionPanel(
                    "Emergency Notifications",
                    `<div class="settings-list">${content}</div>`
                );
            }
        );

    /* =========================================================
       AI ANALYSIS
    ========================================================= */

    document
        .querySelector(".ai-button")
        ?.addEventListener(
            "click",
            function () {

                const incidents =
                    getData(STORAGE.incidents);

                const critical =
                    incidents.filter(
                        item =>
                            item.severity === "Critical"
                    ).length;

                const high =
                    incidents.filter(
                        item =>
                            item.severity === "High"
                    ).length;

                openActionPanel(
                    "NEXUS AI — Situation Analysis",
                    `
                    <div class="team-detail-view">

                        <h3>
                            Current Network Assessment
                        </h3>

                        <p>
                            NEXUS is analyzing current
                            emergency activity across
                            the operations network.
                        </p>

                        <hr>

                        <p>
                            <strong>
                                Critical incidents:
                            </strong>
                            ${critical}
                        </p>

                        <p>
                            <strong>
                                High-priority incidents:
                            </strong>
                            ${high}
                        </p>

                        <p>
                            <strong>
                                AI Priority:
                            </strong>
                            ${
                                critical > 0
                                    ? "CRITICAL"
                                    : high > 0
                                    ? "HIGH"
                                    : "NORMAL"
                            }
                        </p>

                        <p>
                            <strong>
                                Recommendation:
                            </strong>
                            Maintain elevated response
                            readiness and prioritize
                            critical incidents.
                        </p>

                    </div>
                    `
                );
            }
        );

    /* =========================================================
       EXPORT REPORT
    ========================================================= */

    document
        .querySelector("#analyticsPage .primary-btn")
        ?.addEventListener(
            "click",
            exportReport
        );

    function exportReport() {

        const incidents =
            getData(STORAGE.incidents);

        const operations =
            getData(STORAGE.operations);

        const teams =
            getData(STORAGE.teams);

        const resources =
            getData(STORAGE.resources);

        const report = [

            "NEXUS EMERGENCY OPERATIONS NETWORK",

            "===================================",

            "",

            "EMERGENCY ANALYTICS REPORT",

            `Generated: ${new Date().toLocaleString()}`,

            "",

            "SUMMARY",

            "-----------------------------------",

            `Stored Incidents: ${incidents.length}`,

            `Stored Operations: ${operations.length}`,

            `Registered Teams: ${teams.length}`,

            `Stored Resources: ${resources.length}`,

            "",

            "NEXUS Emergency Response Platform",

            "Ethiopia"

        ].join("\n");

        const blob =
            new Blob(
                [report],
                { type: "text/plain" }
            );

        const url =
            URL.createObjectURL(blob);

        const link =
            document.createElement("a");

        link.href = url;

        link.download =
            `NEXUS-Emergency-Report-${Date.now()}.txt`;

        document.body.appendChild(link);

        link.click();

        link.remove();

        URL.revokeObjectURL(url);
    }

    /* =========================================================
       DASHBOARD STATISTICS
    ========================================================= */

    async function updateDashboardStats() {
        const statsCards = document.querySelectorAll(".stats-grid .stat-card");
        if (!statsCards.length) return;

        const token = getAdminToken();
        if (!token) return;

        try {
            const [response, incidentList, operations] = await Promise.all([
                fetch(`${API_BASE_URL}/dashboard/overview`, {
                    headers: { "Authorization": `Bearer ${token}` }
                }),
                fetchIncidentsFromBackend(),
                fetchOperationsFromBackend()
            ]);

            const data = await response.json();
            if (!response.ok || !data.success) return;

            const incidents = data.dashboard.incidents || {};
            const teams = data.dashboard.teams || {};

            const setStat = (id, fallbackIndex, value) => {
                const element =
                    document.getElementById(id) ||
                    statsCards[fallbackIndex]?.querySelector("h2");
                if (element) element.textContent = value;
            };

            const closedStatuses = ["RESOLVED", "CLOSED", "FALSE_ALARM"];
            const openIncidentCount = incidentList.filter(
                incident => !closedStatuses.includes(String(incident.status || "").toUpperCase())
            ).length;

            setStat(
                "statActiveIncidents",
                0,
                incidentList.length
                    ? openIncidentCount
                    : incidents.active_incidents ?? 0
            );
            setStat("statResponseTeams", 1, teams.total_teams ?? 0);
            setStat("statResolvedIncidents", 2, incidents.resolved_incidents ?? 0);

            const affected = incidentList.reduce(
                (total, item) => total + Number(item.people_affected || 0),
                0
            );
            setStat("statPeopleAffected", 3, formatNumber(affected));

            renderDashboardIncidents(incidentList);
            renderDashboardOperations(operations);
            renderDashboardMap(incidentList);
            updateDashboardInsight(incidentList, teams, operations);
        } catch (error) {
            console.error("Dashboard stats error:", error);
        }
    }

    function renderDashboardIncidents(incidents) {
        const container = document.getElementById("dashboardIncidents");
        if (!container) return;

        const recent = [...incidents]
            .sort(
                (first, second) =>
                    new Date(second.reported_at || 0) -
                    new Date(first.reported_at || 0)
            )
            .slice(0, 5);

        if (!recent.length) {
            container.innerHTML =
                '<div class="empty-state">No incidents have been reported yet.</div>';
            return;
        }

        container.innerHTML = recent.map(incident => {
            const severity = String(incident.severity || "LOW").toUpperCase();
            const location =
                incident.location_name ||
                (
                    incident.latitude && incident.longitude
                        ? `${incident.latitude}, ${incident.longitude}`
                        : "Location not provided"
                );

            return `
                <div class="incident">
                    <span class="incident-level ${severityClass(severity)}">${escapeHTML(severity)}</span>
                    <div class="incident-info">
                        <strong>${escapeHTML(incident.title || "Emergency incident")}</strong>
                        <span>${escapeHTML(location)} · ${escapeHTML(String(incident.status || "Unknown").replaceAll("_", " "))}</span>
                    </div>
                    <span class="incident-time">${escapeHTML(formatTime(incident.reported_at))}</span>
                </div>
            `;
        }).join("");
    }

    function renderDashboardOperations(operations) {
        const container = document.getElementById("dashboardOperations");
        if (!container) return;

        if (!operations.length) {
            container.innerHTML =
                '<div class="empty-state">No response operations have been created yet.</div>';
            return;
        }

        container.innerHTML = operations.slice(0, 4).map(operation => {
            const isStandby = String(operation.status || "").toUpperCase() === "STANDBY";
            const location = operation.location_name || "Location not provided";

            return `
                <div class="operation-row">
                    <span class="operation-status ${isStandby ? "standby-status" : ""}"></span>
                    <div>
                        <strong>${escapeHTML(operation.name || "Response operation")}</strong>
                        <small>${escapeHTML(operation.operation_type || "Operation")} · ${escapeHTML(location)}</small>
                    </div>
                    <b>${escapeHTML(operation.status || "UNKNOWN")}</b>
                </div>
            `;
        }).join("");
    }

    function renderDashboardMap(incidents) {
        const markers = document.getElementById("dashboardMapMarkers");
        const summary = document.getElementById("dashboardMapSummary");
        if (!markers || !summary) return;

        const mapped = incidents.filter(incident => {
            if (incident.latitude === null || incident.longitude === null) return false;
            if (incident.latitude === undefined || incident.longitude === undefined) return false;
            return Number.isFinite(Number(incident.latitude)) && Number.isFinite(Number(incident.longitude));
        });

        if (!mapped.length) {
            markers.innerHTML = "";
            summary.textContent = incidents.length
                ? `${incidents.length} incidents reported · no coordinates supplied`
                : "No incidents have been reported yet.";
            return;
        }

        const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

        markers.innerHTML = mapped.slice(0, 12).map(incident => {
            const latitude = clamp(Number(incident.latitude), 3, 15);
            const longitude = clamp(Number(incident.longitude), 33, 48);
            const left = clamp(((longitude - 33) / 15) * 100, 8, 92);
            const top = clamp((1 - (latitude - 3) / 12) * 100, 8, 88);
            const severity = String(incident.severity || "LOW").toUpperCase();

            return `
                <span
                    class="map-marker ${severityClass(severity)}"
                    style="left:${left.toFixed(1)}%;top:${top.toFixed(1)}%"
                    title="${escapeHTML(incident.title || "Incident")} · ${escapeHTML(severity)}"
                >!</span>
            `;
        }).join("");

        summary.textContent = `${mapped.length} of ${incidents.length} incidents mapped by coordinates`;
    }

    function updateDashboardInsight(incidents, teams, operations) {
        const insight = document.getElementById("dashboardInsight");
        const alertText = document.getElementById("alertText");
        const closedStatuses = ["RESOLVED", "CLOSED", "FALSE_ALARM"];

        const openIncidents = incidents.filter(
            incident => !closedStatuses.includes(String(incident.status || "").toUpperCase())
        );
        const criticalIncidents = openIncidents.filter(
            incident => String(incident.severity || "").toUpperCase() === "CRITICAL"
        );
        const activeOperations = operations.filter(
            operation => String(operation.status || "").toUpperCase() === "ACTIVE"
        );

        if (alertText) {
            if (criticalIncidents.length) {
                alertText.textContent = `${criticalIncidents.length} critical incident${criticalIncidents.length === 1 ? "" : "s"} and ${openIncidents.length} open incident${openIncidents.length === 1 ? "" : "s"} require monitoring.`;
            } else if (openIncidents.length) {
                alertText.textContent = `${openIncidents.length} open incident${openIncidents.length === 1 ? "" : "s"} currently require monitoring across the network.`;
            } else {
                alertText.textContent = "No open incidents are currently reported across the network.";
            }
        }

        if (insight) {
            const title = criticalIncidents.length
                ? "Critical response priority"
                : openIncidents.length
                    ? "Active response monitoring"
                    : "Network currently stable";

            const summary = `${openIncidents.length} open incident${openIncidents.length === 1 ? "" : "s"}, ${teams.total_teams ?? 0} registered team${Number(teams.total_teams) === 1 ? "" : "s"}, and ${activeOperations.length} active operation${activeOperations.length === 1 ? "" : "s"}.`;

            insight.innerHTML = `
                <strong>${escapeHTML(title)}</strong>
                <p>${escapeHTML(summary)}</p>
            `;
        }
    }

    /* =========================================================
       ANALYTICS
    ========================================================= */

    async function updateAnalytics() {
        await updateDashboardStats();

        const token = getAdminToken();
        if (!token) return;

        try {
            const [overviewResponse, performanceResponse, regionResponse, typeResponse] = await Promise.all([
                fetch(`${API_BASE_URL}/dashboard/overview`, { headers: { "Authorization": `Bearer ${token}` } }),
                fetch(`${API_BASE_URL}/dashboard/performance`, { headers: { "Authorization": `Bearer ${token}` } }),
                fetch(`${API_BASE_URL}/analytics/incidents-by-region`, { headers: { "Authorization": `Bearer ${token}` } }),
                fetch(`${API_BASE_URL}/analytics/incidents-by-type`, { headers: { "Authorization": `Bearer ${token}` } })
            ]);

            const overviewData = await overviewResponse.json();
            const performanceData = await performanceResponse.json();
            const regionData = await regionResponse.json();
            const typeData = await typeResponse.json();

            if (!overviewResponse.ok || !overviewData.success) throw new Error("Failed to load analytics overview");
            if (!performanceResponse.ok || !performanceData.success) throw new Error("Failed to load response performance");

            const incidents = overviewData.dashboard?.incidents || {};
            const performance = performanceData.performance || {};
            const totalIncidents = Number(incidents.total_incidents || 0);
            const resolvedIncidents = Number(incidents.resolved_incidents || 0);
            const successRate = totalIncidents > 0 ? Math.round((resolvedIncidents / totalIncidents) * 100) : 0;
            const averageResponse = performance.average_response_minutes;

            const totalElement = document.getElementById("analyticsTotalIncidents");
            const resolvedElement = document.getElementById("analyticsResolvedIncidents");
            const responseElement = document.getElementById("analyticsAverageResponse");
            const successElement = document.getElementById("analyticsSuccessRate");

            if (totalElement) totalElement.textContent = totalIncidents;
            if (resolvedElement) resolvedElement.textContent = resolvedIncidents;
            if (responseElement) responseElement.textContent = averageResponse === null || averageResponse === undefined ? "N/A" : `${averageResponse}m`;
            if (successElement) successElement.textContent = `${successRate}%`;

            const regionContainer = document.querySelector("#analyticsPage .bar-chart");
            if (regionContainer && regionResponse.ok && regionData.success) {
                const regions = regionData.data || [];
                const maxCount = Math.max(1, ...regions.map(item => Number(item.count || 0)));
                regionContainer.innerHTML = regions.map(item => {
                    const count = Number(item.count || 0);
                    const width = Math.max(0, Math.round((count / maxCount) * 100));
                    return `
                        <div class="bar-item">
                            <span>${escapeHTML(item.region || "Unknown")}</span>
                            <div class="bar"><div style="width:${width}%"></div></div>
                            <strong>${count}</strong>
                        </div>
                    `;
                }).join("") || '<p>No regional incident data available.</p>';
            }

            const typeContainer = document.querySelector("#analyticsPage .incident-type-list");
            if (typeContainer && typeResponse.ok && typeData.success) {
                const types = typeData.data || [];
                const totalTypeCount = types.reduce((sum, item) => sum + Number(item.count || 0), 0);
                typeContainer.innerHTML = types.map(item => {
                    const count = Number(item.count || 0);
                    const percentage = totalTypeCount > 0 ? Math.round((count / totalTypeCount) * 100) : 0;
                    return `
                        <div class="type-row">
                            <span>${escapeHTML(item.incident_type || "Unknown")}</span>
                            <strong>${percentage}%</strong>
                        </div>
                    `;
                }).join("") || '<p>No incident type data available.</p>';
            }

            const performancePanel = document.querySelector("#analyticsPage .response-chart .performance-chart");
            if (performancePanel) {
                const averageText = averageResponse === null || averageResponse === undefined ? "N/A" : `${averageResponse}m`;
                performancePanel.innerHTML = `<p>Average response time: ${escapeHTML(averageText)}</p><p>Average resolution time: ${escapeHTML(performance.average_resolution_minutes === null || performance.average_resolution_minutes === undefined ? "N/A" : `${performance.average_resolution_minutes}m`)}</p><p>Completed assignments: ${escapeHTML(performance.completed_assignments ?? 0)}</p>`;
            }
        } catch (error) {
            console.error("Analytics error:", error);
            const totalElement = document.getElementById("analyticsTotalIncidents");
            const resolvedElement = document.getElementById("analyticsResolvedIncidents");
            const responseElement = document.getElementById("analyticsAverageResponse");
            const successElement = document.getElementById("analyticsSuccessRate");
            if (totalElement) totalElement.textContent = "N/A";
            if (resolvedElement) resolvedElement.textContent = "N/A";
            if (responseElement) responseElement.textContent = "N/A";
            if (successElement) successElement.textContent = "N/A";
        }
    }
    async function updateTeamsPageStats() {
        const stats = document.querySelectorAll("#teamsPage .operation-stat strong");
        if (!stats.length) return;
        try {
            const teams = await fetchTeamsFromBackend();
            if (stats[0]) stats[0].textContent = teams.length;
            if (stats[1]) stats[1].textContent = teams.filter(team => team.status === "BUSY").length;
            if (stats[2]) stats[2].textContent = teams.filter(team => team.status === "AVAILABLE").length;
            if (stats[3]) stats[3].textContent = teams.filter(team => team.status === "OFFLINE").length;
        } catch (error) {
            console.error("Teams page stats error:", error);
        }
    }

    async function updateResourcesPageStats() {
        const stats = document.querySelectorAll("#resourcesPage .operation-stat strong");
        if (!stats.length) return;
        try {
            const resources = await fetchResourcesFromBackend();
            if (stats[0]) stats[0].textContent = resources.length;
            if (stats[1]) stats[1].textContent = resources.reduce((sum, resource) => sum + Number(resource.available_quantity || 0), 0);
            if (stats[2]) stats[2].textContent = resources.reduce((sum, resource) => sum + (Number(resource.quantity || 0) - Number(resource.available_quantity || 0)), 0);
            if (stats[3]) stats[3].textContent = resources.filter(resource => resource.status === "MAINTENANCE").length;
        } catch (error) {
            console.error("Resources page stats error:", error);
        }
    }

    async function updateOperationsPageStats() {
        const stats = document.querySelectorAll("#operationsPage .operation-stat strong");
        if (!stats.length) return;
        const token = getAdminToken();
        if (!token) return;
        try {
            const [operations, teams, resources, overviewResponse] = await Promise.all([
                fetchOperationsFromBackend(),
                fetchTeamsFromBackend(),
                fetchResourcesFromBackend(),
                fetch(`${API_BASE_URL}/dashboard/overview`, { headers: { "Authorization": `Bearer ${token}` } })
            ]);
            const overviewData = await overviewResponse.json();
            const incidents = overviewData.dashboard?.incidents || {};
            const totalIncidents = Number(incidents.total_incidents || 0);
            const resolvedIncidents = Number(incidents.resolved_incidents || 0);
            const successRate = totalIncidents > 0 ? Math.round((resolvedIncidents / totalIncidents) * 100) : 0;

            if (stats[0]) stats[0].textContent = operations.filter(operation => operation.status === "ACTIVE").length;
            if (stats[1]) stats[1].textContent = teams.filter(team => team.status === "BUSY").length;
            if (stats[2]) stats[2].textContent = resources.reduce((sum, resource) => sum + (Number(resource.quantity || 0) - Number(resource.available_quantity || 0)), 0);
            if (stats[3]) stats[3].textContent = `${successRate}%`;
        } catch (error) {
            console.error("Operations page stats error:", error);
        }
    }

    /* =========================================================
       HELPERS
    ========================================================= */

    function severityClass(severity) {

        const value =
            String(severity || "")
                .toLowerCase();

        if (value === "critical") return "critical";
        if (value === "high") return "high";
        if (value === "medium") return "medium";

        return "low";
    }

    function formatTime(date) {

        if (!date) return "Just now";

        const seconds =
            Math.floor(
                (Date.now() -
                    new Date(date).getTime()) /
                    1000
            );

        if (seconds < 60) {
            return "Just now";
        }

        const minutes =
            Math.floor(seconds / 60);

        if (minutes < 60) {
            return `${minutes} min ago`;
        }

        const hours =
            Math.floor(minutes / 60);

        return `${hours} hr ago`;
    }

    function formatNumber(number) {

        return Number(number).toLocaleString();
    }

    function escapeHTML(value) {

        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    /* =========================================================
       SETTINGS ACTIONS
    ========================================================= */

    document.getElementById("saveSettings")?.addEventListener("click", () => {
        const settings = {
            notifications: document.getElementById("settingNotifications")?.checked ?? true,
            ai: document.getElementById("settingAI")?.checked ?? true,
            refresh: document.getElementById("settingRefresh")?.checked ?? true,
            twoFA: document.getElementById("setting2FA")?.checked ?? false,
            audit: document.getElementById("settingAudit")?.checked ?? true,
            priority: document.getElementById("defaultPriority")?.value || "High",
            region: document.getElementById("responseRegion")?.value || "All Regions"
        };

        localStorage.setItem(STORAGE.settings, JSON.stringify(settings));
        alert("Settings saved.");
    });

    document.getElementById("resetSettings")?.addEventListener("click", () => {
        if (!confirm("Reset all settings to their defaults?")) return;

        localStorage.removeItem(STORAGE.settings);
        loadSettings();
        alert("Settings reset to defaults.");
    });

    /* =========================================================
       INITIALIZE
    ========================================================= */

    renderIncidents();
    renderOperations();
    renderTeams();
    renderResources();
    updateTeamsPageStats();
    updateResourcesPageStats();
    updateOperationsPageStats();

    showDashboard();

});
// =========================================================
// SETTINGS PAGE
// =========================================================

const settingsNav = document.querySelector(".sidebar-bottom .nav-item");
const settingsPage = document.getElementById("settingsPage");

if (settingsNav && settingsPage) {

    settingsNav.addEventListener("click", function (e) {
        e.preventDefault();

        // Hide all pages
        document.querySelectorAll(".page-section").forEach(function (page) {
            page.classList.remove("active");
        });

        // Show Settings
        settingsPage.classList.add("active");

        // Update sidebar
        document.querySelectorAll(".nav-item").forEach(function (item) {
            item.classList.remove("active");
        });

        settingsNav.classList.add("active");

        // Update topbar
        const title = document.querySelector(".topbar h1");
        const subtitle = document.querySelector(".topbar p");

        if (title) {
            title.textContent = "System Settings";
        }

        if (subtitle) {
            subtitle.textContent =
                "Configure NEXUS platform preferences and operational controls";
        }

        // Scroll to top
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
}
