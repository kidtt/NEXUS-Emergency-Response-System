/* =========================================================
   NEXUS — PUBLIC EMERGENCY RESPONSE
   Public Portal JavaScript
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       ELEMENTS
    ===================================================== */

    const reportButtons = document.querySelectorAll(
        ".nav-emergency, .hero-primary, .cta-button"
    );

    const reportOverlay = document.querySelector(".report-overlay");
    const closeReport = document.querySelector(".close-report");

    const typeButtons = document.querySelectorAll(
        ".type-selector button"
    );

    const submitReport = document.querySelector(".submit-report");

    const locationButton = document.querySelector(
        ".location-input button"
    );

    const locationInput = document.querySelector(
        ".location-input input"
    );


    /* =====================================================
       OPEN REPORT MODAL
    ===================================================== */

    function openReportModal() {

        if (!reportOverlay) return;

        reportOverlay.classList.add("show");

        document.body.style.overflow = "hidden";
    }


    /* =====================================================
       CLOSE REPORT MODAL
    ===================================================== */

    function closeReportModal() {

        if (!reportOverlay) return;

        reportOverlay.classList.remove("show");

        document.body.style.overflow = "";
    }


    /* =====================================================
       REPORT BUTTONS
    ===================================================== */

    reportButtons.forEach(button => {

        button.addEventListener("click", event => {

            event.preventDefault();

            openReportModal();

        });

    });


    /* =====================================================
       CLOSE BUTTON
    ===================================================== */

    if (closeReport) {

        closeReport.addEventListener(
            "click",
            closeReportModal
        );

    }


    /* =====================================================
       CLOSE WHEN CLICKING OUTSIDE MODAL
    ===================================================== */

    if (reportOverlay) {

        reportOverlay.addEventListener("click", event => {

            if (event.target === reportOverlay) {

                closeReportModal();

            }

        });

    }


    /* =====================================================
       ESCAPE KEY
    ===================================================== */

    document.addEventListener("keydown", event => {

        if (
            event.key === "Escape" &&
            reportOverlay &&
            reportOverlay.classList.contains("show")
        ) {

            closeReportModal();

        }

    });


    /* =====================================================
       EMERGENCY TYPE SELECTION
    ===================================================== */

    typeButtons.forEach(button => {

        button.addEventListener("click", () => {

            typeButtons.forEach(btn => {

                btn.classList.remove("selected");

            });

            button.classList.add("selected");

        });

    });


    /* =====================================================
       GET USER LOCATION
    ===================================================== */

    if (locationButton) {

        locationButton.addEventListener("click", () => {

            if (!navigator.geolocation) {

                alert(
                    "Location services are not supported by your browser."
                );

                return;

            }

            locationButton.textContent = "Locating...";

            locationButton.disabled = true;


            navigator.geolocation.getCurrentPosition(

                position => {

                    const latitude =
                        position.coords.latitude;

                    const longitude =
                        position.coords.longitude;


                    if (locationInput) {

                        locationInput.value =
                            `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

                    }

                    locationButton.textContent =
                        "✓ Location Added";

                    locationButton.disabled = false;

                },

                error => {

                    console.error(
                        "Location error:",
                        error
                    );

                    locationButton.textContent =
                        "Use My Location";

                    locationButton.disabled = false;

                    alert(
                        "Unable to get your location. Please enter it manually."
                    );

                }

            );

        });

    }


    /* =====================================================
       FORM VALIDATION
    ===================================================== */

    function validateReport() {

        const selectedType =
            document.querySelector(
                ".type-selector button.selected"
            );

        const description =
            document.querySelector(
                '.form-group textarea'
            );

        const location =
            document.querySelector(
                '.location-input input'
            );


        if (!selectedType) {

            alert(
                "Please select the type of emergency."
            );

            return false;

        }


        if (
            !description ||
            description.value.trim().length < 5
        ) {

            alert(
                "Please provide a short description of the emergency."
            );

            if (description) {

                description.focus();

            }

            return false;

        }


        if (
            !location ||
            location.value.trim() === ""
        ) {

            alert(
                "Please provide the emergency location."
            );

            if (location) {

                location.focus();

            }

            return false;

        }


        return true;

    }


    /* =====================================================
       SUBMIT EMERGENCY REPORT
    ===================================================== */

    if (submitReport) {

    submitReport.addEventListener("click", async event => {

        event.preventDefault();

        if (!validateReport()) {
            return;
        }

        const selectedType =
            document.querySelector(
                ".type-selector button.selected"
            );

        const description =
            document.querySelector(
                ".form-group textarea"
            );

        const location =
            document.querySelector(
                ".location-input input"
            );

        /* ---------------------------------------------
           CHECK LOGIN
        --------------------------------------------- */

        const token =
            localStorage.getItem("nexus_token") ||
            sessionStorage.getItem("nexus_token");

        if (!token) {

            alert(
                "Please login before reporting an emergency."
            );

            window.location.href = "login.html";

            return;
        }

        /* ---------------------------------------------
           MAP EMERGENCY TYPE
        --------------------------------------------- */

        const typeMap = {
            "Fire": "FIRE",
            "Medical": "MEDICAL",
            "Flood": "FLOOD",
            "Accident": "ACCIDENT",
            "Security": "SECURITY",
            "Natural Disaster": "OTHER"
        };

        const frontendType =
            selectedType.dataset.type ||
            selectedType.textContent.trim();

        const incidentType =
            typeMap[frontendType] || "OTHER";

        /* ---------------------------------------------
           READ LOCATION
        --------------------------------------------- */

        let latitude = null;
        let longitude = null;

        let locationName =
            location.value.trim();

        /*
         * If the location field contains:
         * 9.1450, 40.4897
         * extract latitude and longitude.
         */

        const coordinateMatch =
            locationName.match(
                /^(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)$/
            );

        if (coordinateMatch) {

            latitude =
                parseFloat(coordinateMatch[1]);

            longitude =
                parseFloat(coordinateMatch[2]);

            locationName =
                "Current location";
        }

        /* ---------------------------------------------
           DATA FOR BACKEND
        --------------------------------------------- */

        const reportData = {

            title:
                `${frontendType} Emergency`,

            description:
                description.value.trim(),

            incident_type:
                incidentType,

            severity:
                "MEDIUM",

            latitude:
                latitude,

            longitude:
                longitude,

            location_name:
                locationName

        };

        console.log(
            "Sending Emergency Report:",
            reportData
        );

        /* ---------------------------------------------
           SUBMITTING STATE
        --------------------------------------------- */

        submitReport.disabled = true;

        submitReport.innerHTML =
            "Sending Emergency Report...";

        /* ---------------------------------------------
           SEND TO NEXUS BACKEND
        --------------------------------------------- */

        try {

            const response =
                await fetch(
                    "http://localhost:5000/api/incidents",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

                            "Authorization":
                                `Bearer ${token}`
                        },

                        body:
                            JSON.stringify(
                                reportData
                            )
                    }
                );

            const data =
                await response.json();

            console.log(
                "Backend Response:",
                data
            );

            /* -----------------------------------------
               TOKEN EXPIRED / INVALID
            ----------------------------------------- */

            if (response.status === 401) {

                localStorage.removeItem(
                    "nexus_token"
                );

                sessionStorage.removeItem(
                    "nexus_token"
                );

                localStorage.removeItem(
                    "nexus_user"
                );

                alert(
                    "Your session has expired. Please login again."
                );

                window.location.href =
                    "login.html";

                return;
            }

            /* -----------------------------------------
               BACKEND ERROR
            ----------------------------------------- */

            if (
                !response.ok ||
                !data.success
            ) {

                throw new Error(
                    data.message ||
                    "Failed to submit emergency report."
                );

            }

            /* -----------------------------------------
               SUCCESS
            ----------------------------------------- */

            const incident =
                data.incident;

            console.log(
                "Created Incident:",
                incident
            );

            console.log(
                "AI Intelligence:",
                data.intelligence
            );

            /*
             * Use the REAL database incident ID.
             */

            const referenceId =
                `NXS-${String(
                    incident.id
                ).padStart(6, "0")}`;

            showSuccessMessage(
                referenceId,
                incident
            );

        } catch (error) {

            console.error(
                "Emergency Report Error:",
                error
            );

            alert(
                error.message ||
                "Unable to submit emergency report."
            );

            submitReport.disabled =
                false;

            submitReport.innerHTML =
                "🚨 Submit Emergency Report";

        }

    });

}

            
/* =====================================================
   SUCCESS MESSAGE
===================================================== */

function showSuccessMessage(
    referenceId,
    incident
) {

    if (!reportOverlay) return;

    const modal =
        document.querySelector(".report-modal");

    if (!modal) return;


    modal.innerHTML = `

        <div
            style="
                text-align:center;
                padding:35px 10px;
            "
        >

            <!-- SUCCESS ICON -->

            <div
                style="
                    width:70px;
                    height:70px;
                    margin:0 auto 20px;
                    border-radius:50%;
                    background:#ecfdf3;
                    color:#16a34a;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    font-size:30px;
                    font-weight:bold;
                "
            >
                ✓
            </div>


            <!-- TITLE -->

            <h2
                style="
                    font-size:25px;
                    margin-bottom:12px;
                "
            >
                Emergency Report Sent
            </h2>


            <!-- MESSAGE -->

            <p
                style="
                    color:#64748b;
                    font-size:12px;
                    line-height:1.7;
                    max-width:380px;
                    margin:0 auto 25px;
                "
            >
                Your emergency report has been successfully
                received by the NEXUS emergency response network.
                Response coordination can now begin.
            </p>


            <!-- REFERENCE ID -->

            <div
                style="
                    background:#f8fafc;
                    border:1px solid #e2e8f0;
                    padding:14px;
                    border-radius:8px;
                    margin-bottom:15px;
                    font-size:10px;
                    color:#475569;
                "
            >

                <strong>
                    REFERENCE ID
                </strong>

                <br><br>

                <span
                    style="
                        font-size:18px;
                        font-weight:bold;
                        color:#0f172a;
                    "
                >
                    ${referenceId}
                </span>

            </div>


            <!-- STATUS -->

            <div
                style="
                    background:#f0fdf4;
                    border:1px solid #bbf7d0;
                    padding:12px;
                    border-radius:8px;
                    margin-bottom:20px;
                    font-size:11px;
                    color:#166534;
                "
            >

                Status:
                <strong>
                    ${incident.status}
                </strong>

            </div>


            <!-- DONE BUTTON -->

            <button
                class="primary-btn"
                id="closeSuccess"
                style="
                    width:100%;
                    padding:13px;
                    cursor:pointer;
                "
            >
                Done
            </button>

        </div>

    `;


    /* ---------------------------------------------
       CLOSE SUCCESS MESSAGE
    --------------------------------------------- */

    const closeSuccess =
        document.querySelector("#closeSuccess");


    if (closeSuccess) {

        closeSuccess.addEventListener(
            "click",
            closeReportModal
        );

    }

}
    /* =====================================================
       NAVIGATION SCROLL
    ===================================================== */

    document
        .querySelectorAll('.public-nav a[href^="#"]')
        .forEach(link => {

            link.addEventListener("click", event => {

                const targetId =
                    link.getAttribute("href");

                const target =
                    document.querySelector(targetId);


                if (!target) return;


                event.preventDefault();


                target.scrollIntoView({
                    behavior: "smooth"
                });

            });

        });


    /* =====================================================
       ACTIVE NAVIGATION
    ===================================================== */

    const sections =
        document.querySelectorAll("section[id]");

    const navLinks =
        document.querySelectorAll(
            '.public-nav a[href^="#"]'
        );


    window.addEventListener("scroll", () => {

        let currentSection = "";


        sections.forEach(section => {

            const sectionTop =
                section.offsetTop - 120;


            if (
                window.scrollY >= sectionTop
            ) {

                currentSection =
                    section.getAttribute("id");

            }

        });


        navLinks.forEach(link => {

            link.classList.remove("active");


            if (
                link.getAttribute("href") ===
                `#${currentSection}`
            ) {

                link.classList.add("active");

            }

        });

    });

    /* =====================================================
       CITIZEN LOGIN
    ===================================================== */

    const loginForm =
        document.getElementById("loginForm");

    if (loginForm) {

        const loginButton =
            document.getElementById("loginButton");

        const loginMessage =
            document.getElementById("loginMessage");

        const loginEmail =
            document.getElementById("email");

        const loginPassword =
            document.getElementById("password");

        const rememberMe =
            document.getElementById("rememberMe");


        loginForm.addEventListener(
            "submit",
            async event => {

                event.preventDefault();


                const email =
                    loginEmail.value.trim();

                const password =
                    loginPassword.value;


                /* -----------------------------------------
                   VALIDATION
                ----------------------------------------- */

                if (!email || !loginEmail.validity.valid) {

                    loginMessage.textContent =
                        "Please enter a valid email address.";

                    loginMessage.className =
                        "register-message error";

                    loginEmail.focus();

                    return;
                }


                if (!password) {

                    loginMessage.textContent =
                        "Please enter your password.";

                    loginMessage.className =
                        "register-message error";

                    loginPassword.focus();

                    return;
                }


                /* -----------------------------------------
                   LOADING
                ----------------------------------------- */

                loginButton.disabled = true;

                loginButton.textContent =
                    "Signing In...";

                loginMessage.textContent = "";

                loginMessage.className =
                    "register-message";


                try {

                    /* -------------------------------------
                       REAL BACKEND LOGIN
                    ------------------------------------- */

                    const response = await fetch(
                        "http://localhost:5000/api/auth/login",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                email,
                                password
                            })
                        }
                    );


                    const data =
                        await response.json();


                    /* -------------------------------------
                       BACKEND ERROR
                    ------------------------------------- */

                    if (!response.ok) {

                        throw new Error(
                            data.message ||
                            "Invalid email or password."
                        );
                    }


                    /* -------------------------------------
                       CHECK TOKEN
                    ------------------------------------- */

                    if (!data.token) {

                        throw new Error(
                            "Login succeeded but no authentication token was received."
                        );
                    }


                    /* -------------------------------------
                       SAVE JWT
                    ------------------------------------- */

                    if (rememberMe.checked) {

                        localStorage.setItem(
                            "nexus_token",
                            data.token
                        );

                    } else {

                        sessionStorage.setItem(
                            "nexus_token",
                            data.token
                        );

                    }


                    /* -------------------------------------
                       SAVE USER INFORMATION
                    ------------------------------------- */

                    if (data.user) {

                        localStorage.setItem(
                            "nexus_user",
                            JSON.stringify(data.user)
                        );

                    }


                    /* -------------------------------------
                       SUCCESS
                    ------------------------------------- */

                    loginMessage.textContent =
    "Login successful. Redirecting...";

loginMessage.className =
    "register-message success";

if (data.user && data.user.role === "ADMIN") {

    window.location.href =
        "../fronted/index.html";

} else {

    window.location.href =
        "public.html";

}


                   


                } catch (error) {

                    console.error(
                        "NEXUS login error:",
                        error
                    );


                    loginMessage.textContent =
                        error.message ||
                        "Unable to login. Please try again.";

                    loginMessage.className =
                        "register-message error";


                    loginButton.disabled =
                        false;

                    loginButton.textContent =
                        "Sign In";
                }

            }
        );

    }


    /* =====================================================
       INITIALIZE
    ===================================================== */

    console.log(
        "NEXUS Public Emergency Portal initialized."
    );
    
    // =====================================================
// CITIZEN PROFILE / AUTH NAVIGATION
// =====================================================

function getNexusToken() {

    return (
        localStorage.getItem("nexus_token") ||
        sessionStorage.getItem("nexus_token")
    );

}


function getNexusUser() {

    const user =
        localStorage.getItem("nexus_user");

    if (!user) return null;

    try {

        return JSON.parse(user);

    } catch (error) {

        console.error(
            "Invalid stored NEXUS user:",
            error
        );

        return null;
    }

}



function updateAuthNavigation() {

    const registerNav =
        document.getElementById("registerNav");

    const loginNav =
        document.getElementById("loginNav");

    const profileNav =
        document.getElementById("profileNav");

    const profileName =
        document.getElementById("profileName");

    const logoutNav =
        document.getElementById("logoutNav");


    const token = getNexusToken();
    const user = getNexusUser();


    /* =====================================================
       USER IS LOGGED IN
    ===================================================== */

    if (token && user) {

        if (registerNav) {
            registerNav.style.display = "none";
        }

        if (loginNav) {
            loginNav.style.display = "none";
        }

        if (profileNav) {
            profileNav.style.display = "inline-block";
        }

        if (profileName) {
            profileName.textContent =
                user.full_name || "Citizen";
        }

        if (logoutNav) {
            logoutNav.style.display = "inline-block";
        }

    }

    /* =====================================================
       USER IS NOT LOGGED IN
    ===================================================== */

    else {

        if (registerNav) {
            registerNav.style.display = "inline-block";
        }

        if (loginNav) {
            loginNav.style.display = "inline-block";
        }

        if (profileNav) {
            profileNav.style.display = "none";
        }

        if (logoutNav) {
            logoutNav.style.display = "none";
        }

    }

}



// =====================================================
// LOGOUT
// =====================================================

const logoutNav =
    document.getElementById("logoutNav");


document.addEventListener("DOMContentLoaded", function () {

    const logoutButton =
        document.getElementById("logoutNav");

    if (!logoutButton) return;

    logoutButton.addEventListener("click", function () {

        console.log("NEXUS logout clicked");

        localStorage.removeItem("nexus_token");
        localStorage.removeItem("nexus_user");

        sessionStorage.removeItem("nexus_token");
        sessionStorage.removeItem("nexus_user");

        window.location.href = "public.html";
    });

});

document.addEventListener("click", function (event) {
    if (event.target && event.target.id === "logoutNav") {
        event.preventDefault();

        localStorage.removeItem("nexus_token");
        localStorage.removeItem("nexus_user");
        sessionStorage.removeItem("nexus_token");
        sessionStorage.removeItem("nexus_user");

        window.location.href = "public.html";
    }
});
window.requireNexusLogin = function () {
    const token = getNexusToken();
    const user = getNexusUser();

    if (!token || !user) {
        window.location.href = "login.html";
        return false;
    }

    return true;
};
document.addEventListener("click", function (event) {

    /* OPEN PROFILE */
    if (event.target.closest("#profileNav")) {

        const user = getNexusUser();

        if (!user) {
            window.location.href = "login.html";
            return;
        }

        const modal = document.getElementById("profileModal");

        if (!modal) return;

        document.getElementById("profileModalName").textContent =
            user.full_name || "Citizen";

        document.getElementById("profileModalEmail").textContent =
            user.email || "Not available";

        document.getElementById("profileModalPhone").textContent =
            user.phone || "Not available";

        document.getElementById("profileModalRole").textContent =
            user.role || "CITIZEN";

        document.getElementById("profileModalRoleDetail").textContent =
            user.role || "CITIZEN";

        modal.classList.add("active");
    }

    /* CLOSE PROFILE */
    if (event.target.closest("#closeProfileModal")) {
        const modal = document.getElementById("profileModal");

        if (modal) {
            modal.classList.remove("active");
        }
    }

});
// =====================================================
// MOBILE NAVIGATION
// =====================================================

const navToggle = document.getElementById("navToggle");
const primaryNav = document.getElementById("primaryNav");

if (navToggle && primaryNav) {

    navToggle.addEventListener("click", function () {

        const isOpen = primaryNav.classList.toggle("open");

        navToggle.classList.toggle("open", isOpen);
        navToggle.setAttribute("aria-expanded", String(isOpen));

    });

}


// =====================================================
// INITIALIZE AUTH NAVIGATION
// =====================================================

updateAuthNavigation();


/* =====================================================
   INITIALIZE
===================================================== */

console.log(
    "NEXUS Public Emergency Portal initialized."
);
})
/* =====================================================
   GLOBAL REPORT MODAL CONTROLS
   Used by inline portal buttons and category cards.
===================================================== */

window.openReport = function (type) {
    const overlay = document.getElementById("reportOverlay");

    if (!overlay) {
        const target = type
            ? `report.html?type=${encodeURIComponent(type)}`
            : "report.html";
        window.location.href = target;
        return;
    }

    overlay.classList.add("show");

    if (type) {
        const button = overlay.querySelector(
            `.type-selector button[data-type="${type}"]`
        );

        if (button) {
            overlay.querySelectorAll(".type-selector button").forEach(item => {
                item.classList.remove("selected");
            });

            button.classList.add("selected");

            const hiddenType = document.getElementById("emergencyType");
            if (hiddenType) hiddenType.value = type;
        }
    }

    const firstField = overlay.querySelector(
        ".type-selector button, input, textarea"
    );

    if (firstField) {
        window.setTimeout(() => firstField.focus(), 120);
    }
};

window.closeReport = function () {
    const overlay = document.getElementById("reportOverlay");
    if (overlay) overlay.classList.remove("show");
};
