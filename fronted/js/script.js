
/* =========================================================
   NEXUS EMERGENCY MANAGEMENT SYSTEM
   MAIN JAVASCRIPT
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    console.log("NEXUS System initialized");


    /* =====================================================
       1. MOBILE NAVIGATION
       ===================================================== */

    const menuBtn = document.querySelector("#menuBtn");
    const mobileMenu = document.querySelector("#mobileMenu");

    if (menuBtn && mobileMenu) {

        menuBtn.addEventListener("click", () => {

            mobileMenu.classList.toggle("show");

        });

    }


    /* =====================================================
       2. SETTINGS - SAVE CHANGES
       ===================================================== */

    const saveSettingsBtn =
        document.querySelector("#saveSettingsBtn");

    if (saveSettingsBtn) {

        saveSettingsBtn.addEventListener("click", () => {

            const systemName =
                document.querySelector("#systemName")?.value;

            if (!systemName) {

                alert("Please enter a system name.");

                return;
            }

            alert("Settings saved successfully.");

        });

    }


    /* =====================================================
       3. RESET SETTINGS
       ===================================================== */

    const resetSettingsBtn =
        document.querySelector("#resetSettingsBtn");

    if (resetSettingsBtn) {

        resetSettingsBtn.addEventListener("click", () => {

            const confirmed =
                confirm(
                    "Are you sure you want to reset all settings?"
                );

            if (!confirmed) {
                return;
            }

            const systemName =
                document.querySelector("#systemName");

            const organization =
                document.querySelector("#organization");

            const timezone =
                document.querySelector("#timezone");

            const language =
                document.querySelector("#language");

            if (systemName) {
                systemName.value =
                    "NEXUS Emergency Management";
            }

            if (organization) {
                organization.value =
                    "Emergency Management Center";
            }

            if (timezone) {
                timezone.value = "eat";
            }

            if (language) {
                language.value = "english";
            }

            alert("Settings restored to default.");

        });

    }


    /* =====================================================
       4. CLEAR DEMO DATA
       ===================================================== */

    const clearDemoDataBtn =
        document.querySelector("#clearDemoDataBtn");

    if (clearDemoDataBtn) {

        clearDemoDataBtn.addEventListener("click", () => {

            const confirmed =
                confirm(
                    "Are you sure you want to clear demo data?"
                );

            if (!confirmed) {
                return;
            }

            alert("Demo data cleared successfully.");

        });

    }


    /* =====================================================
       5. SEARCH INCIDENTS
       ===================================================== */

    const incidentSearch =
        document.querySelector("#incidentSearch");

    if (incidentSearch) {

        incidentSearch.addEventListener("input", () => {

            const searchValue =
                incidentSearch.value.toLowerCase().trim();

            const rows =
                document.querySelectorAll(
                    ".incident-table tbody tr"
                );

            rows.forEach(row => {

                const rowText =
                    row.textContent.toLowerCase();

                if (rowText.includes(searchValue)) {

                    row.style.display = "";

                } else {

                    row.style.display = "none";

                }

            });

        });

    }


    /* =====================================================
       6. INCIDENT STATUS FILTER
       ===================================================== */

    const incidentStatusFilter =
        document.querySelector("#incidentStatusFilter");

    if (incidentStatusFilter) {

        incidentStatusFilter.addEventListener("change", () => {

            const selected =
                incidentStatusFilter.value.toLowerCase();

            const rows =
                document.querySelectorAll(
                    ".incident-table tbody tr"
                );

            rows.forEach(row => {

                if (
                    selected === "all" ||
                    row.textContent
                        .toLowerCase()
                        .includes(selected)
                ) {

                    row.style.display = "";

                } else {

                    row.style.display = "none";

                }

            });

        });

    }


    /* =====================================================
       7. GENERIC CONFIRMATION BUTTONS
       ===================================================== */

    const confirmButtons =
        document.querySelectorAll("[data-confirm]");

    confirmButtons.forEach(button => {

        button.addEventListener("click", event => {

            const message =
                button.dataset.confirm ||
                "Are you sure?";

            const confirmed =
                confirm(message);

            if (!confirmed) {

                event.preventDefault();

            }

        });

    });


    /* =====================================================
       8. REPORT GENERATION DEMO
       ===================================================== */

    const generateReportBtn =
        document.querySelector("#generateReportBtn");

    if (generateReportBtn) {

        generateReportBtn.addEventListener("click", () => {

            generateReportBtn.disabled = true;

            generateReportBtn.textContent =
                "Generating...";

            setTimeout(() => {

                generateReportBtn.disabled = false;

                generateReportBtn.textContent =
                    "Generate Report";

                alert(
                    "Emergency report generated successfully."
                );

            }, 1200);

        });

    }


    /* =====================================================
       9. RESPONSE TEAM ASSIGNMENT
       ===================================================== */

    const assignmentForm =
        document.querySelector("#assignmentForm");

    if (assignmentForm) {

        assignmentForm.addEventListener("submit", event => {

            event.preventDefault();

            const team =
                document.querySelector("#teamSelect")?.value;

            const incident =
                document.querySelector("#incidentSelect")?.value;

            if (!team || !incident) {

                alert(
                    "Please select an incident and response team."
                );

                return;
            }

            alert(
                "Response team assigned successfully."
            );

            assignmentForm.reset();

        });

    }


    /* =====================================================
       10. FORM VALIDATION
       ===================================================== */

    const forms =
        document.querySelectorAll("form");

    forms.forEach(form => {

        form.addEventListener("submit", event => {

            const requiredInputs =
                form.querySelectorAll(
                    "input[required], select[required], textarea[required]"
                );

            let valid = true;

            requiredInputs.forEach(input => {

                if (!input.value.trim()) {

                    valid = false;

                    input.style.borderColor =
                        "#dc3545";

                } else {

                    input.style.borderColor =
                        "";

                }

            });

            if (!valid) {

                event.preventDefault();

                alert(
                    "Please complete all required fields."
                );

            }

        });

    });


    /* =====================================================
       11. AUTO REMOVE INPUT ERROR
       ===================================================== */

    const inputs =
        document.querySelectorAll(
            "input, select, textarea"
        );

    inputs.forEach(input => {

        input.addEventListener("input", () => {

            input.style.borderColor = "";

        });

        input.addEventListener("change", () => {

            input.style.borderColor = "";

        });

    });


    /* =====================================================
       12. LIVE SYSTEM STATUS
       ===================================================== */

    const systemStatus =
        document.querySelector(".system-status");

    if (systemStatus) {

        setInterval(() => {

            const dot =
                systemStatus.querySelector(".status-dot");

            if (dot) {

                dot.classList.toggle("status-pulse");

            }

        }, 3000);

    }


    /* =====================================================
       13. DELETE / REMOVE ITEMS
       ===================================================== */

    const deleteButtons =
        document.querySelectorAll(
            "[data-delete]"
        );

    deleteButtons.forEach(button => {

        button.addEventListener("click", () => {

            const confirmed =
                confirm(
                    "Are you sure you want to remove this item?"
                );

            if (!confirmed) {
                return;
            }

            const targetSelector =
                button.dataset.delete;

            const target =
                document.querySelector(targetSelector);

            if (target) {

                target.remove();

            }

        });

    });


    /* =====================================================
       14. DASHBOARD COUNTER ANIMATION
       ===================================================== */

    const counters =
        document.querySelectorAll(
            "[data-counter]"
        );

    counters.forEach(counter => {

        const target =
            Number(counter.dataset.counter);

        if (Number.isNaN(target)) {
            return;
        }

        let current = 0;

        const increment =
            Math.max(1, Math.ceil(target / 30));

        const updateCounter = () => {

            current += increment;

            if (current >= target) {

                counter.textContent = target;

                return;

            }

            counter.textContent = current;

            requestAnimationFrame(updateCounter);

        };

        updateCounter();

    });


    /* =====================================================
       15. SMOOTH SCROLL
       ===================================================== */

    const scrollLinks =
        document.querySelectorAll(
            'a[href^="#"]'
        );

    scrollLinks.forEach(link => {

        link.addEventListener("click", event => {

            const targetId =
                link.getAttribute("href");

            if (
                !targetId ||
                targetId === "#"
            ) {
                return;
            }

            const target =
                document.querySelector(targetId);

            if (!target) {
                return;
            }

            event.preventDefault();

            target.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        });

    });


    /* =====================================================
       16. ACTIVE NAVIGATION
       ===================================================== */

    const currentPage =
        window.location.pathname
            .split("/")
            .pop();

    const navLinks =
        document.querySelectorAll(
            ".admin-nav-link"
        );

    navLinks.forEach(link => {

        const href =
            link.getAttribute("href");

        if (!href) {
            return;
        }

        const linkPage =
            href.split("/").pop();

        if (linkPage === currentPage) {

            link.classList.add("active");

        }

    });


    /* =====================================================
       17. EMERGENCY REPORT FORM
       ===================================================== */

    const emergencyForm =
        document.querySelector("#emergencyForm");

    if (emergencyForm) {

        emergencyForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                const name =
                    document.querySelector("#reporterName")
                        ?.value;

                const location =
                    document.querySelector("#location")
                        ?.value;

                const type =
                    document.querySelector("#incidentType")
                        ?.value;

                if (
                    !name ||
                    !location ||
                    !type
                ) {

                    alert(
                        "Please provide all emergency information."
                    );

                    return;
                }

                alert(
                    "Emergency report submitted successfully."
                );

                emergencyForm.reset();

            }
        );

    }


    /* =====================================================
       18. LOGIN FORM DEMO
       ===================================================== */

    const loginForm =
        document.querySelector("#loginForm");

    if (loginForm) {

        loginForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                const email =
                    document.querySelector("#email")
                        ?.value;

                const password =
                    document.querySelector("#password")
                        ?.value;

                if (
                    !email ||
                    !password
                ) {

                    alert(
                        "Please enter your email and password."
                    );

                    return;
                }

                alert(
                    "Login form submitted."
                );

            }
        );

    }


    /* =====================================================
       19. REGISTER FORM DEMO
       ===================================================== */

    const registerForm =
        document.querySelector("#registerForm");

    if (registerForm) {

        registerForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                const password =
                    document.querySelector("#password")
                        ?.value;

                const confirmPassword =
                    document.querySelector(
                        "#confirmPassword"
                    )?.value;

                if (
                    password &&
                    confirmPassword &&
                    password !== confirmPassword
                ) {

                    alert(
                        "Passwords do not match."
                    );

                    return;
                }

                alert(
                    "Registration form submitted successfully."
                );

                registerForm.reset();

            }
        );

    }


    /* =====================================================
       20. CONSOLE INFORMATION
       ===================================================== */

    console.log(
        "NEXUS Emergency Management System is ready."
    );

});