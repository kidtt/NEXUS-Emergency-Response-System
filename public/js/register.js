document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("registerForm");

    if (!form) return;

    const fullName = document.getElementById("fullName");
    const email = document.getElementById("email");
    const phone = document.getElementById("phone");
    const location = document.getElementById("location");
    const password = document.getElementById("password");
    const confirmPassword = document.getElementById("confirmPassword");
    const terms = document.getElementById("terms");

    const registerButton =
        document.getElementById("registerButton");

    const message =
        document.getElementById("registerMessage");

    const strengthBar =
        document.getElementById("strengthBar");

    const strengthText =
        document.getElementById("strengthText");

    const passwordMatch =
        document.getElementById("passwordMatch");


    /* =====================================================
       SHOW / HIDE PASSWORD
    ===================================================== */

    document
        .getElementById("togglePassword")
        .addEventListener("click", () => {

            const hidden = password.type === "password";

            password.type = hidden ? "text" : "password";

            document.getElementById(
                "togglePassword"
            ).textContent = hidden ? "Hide" : "Show";
        });


    document
        .getElementById("toggleConfirmPassword")
        .addEventListener("click", () => {

            const hidden =
                confirmPassword.type === "password";

            confirmPassword.type =
                hidden ? "text" : "password";

            document.getElementById(
                "toggleConfirmPassword"
            ).textContent = hidden ? "Hide" : "Show";
        });


    /* =====================================================
       PASSWORD STRENGTH
    ===================================================== */

    password.addEventListener("input", () => {

        const value = password.value;

        let score = 0;

        if (value.length >= 8) score++;
        if (/[A-Z]/.test(value)) score++;
        if (/[0-9]/.test(value)) score++;
        if (/[^A-Za-z0-9]/.test(value)) score++;

        strengthBar.style.width = `${score * 25}%`;

        if (value.length === 0) {
            strengthText.textContent =
                "At least 8 characters";
        } else if (score <= 1) {
            strengthText.textContent =
                "Weak password";
        } else if (score === 2) {
            strengthText.textContent =
                "Medium password";
        } else if (score === 3) {
            strengthText.textContent =
                "Strong password";
        } else {
            strengthText.textContent =
                "Very strong password";
        }
    });


    /* =====================================================
       PASSWORD MATCH
    ===================================================== */

    confirmPassword.addEventListener(
        "input",
        checkPasswords
    );

    password.addEventListener(
        "input",
        checkPasswords
    );


    function checkPasswords() {

        if (!confirmPassword.value) {

            passwordMatch.textContent = "";

            return true;
        }

        if (password.value === confirmPassword.value) {

            passwordMatch.textContent =
                "✓ Passwords match";

            passwordMatch.className =
                "password-match success";

            return true;
        }

        passwordMatch.textContent =
            "✕ Passwords do not match";

        passwordMatch.className =
            "password-match error";

        return false;
    }


    /* =====================================================
       CLEAR MESSAGE
    ===================================================== */

    function clearMessage() {

        message.textContent = "";

        message.className =
            "register-message";
    }


    /* =====================================================
       VALIDATION
    ===================================================== */

    function validateForm() {

        clearMessage();

        if (fullName.value.trim().length < 2) {

            showError(
                "Please enter your full name."
            );

            fullName.focus();

            return false;
        }

        if (!email.validity.valid) {

            showError(
                "Please enter a valid email address."
            );

            email.focus();

            return false;
        }

        if (phone.value.trim().length < 9) {

            showError(
                "Please enter a valid phone number."
            );

            phone.focus();

            return false;
        }

        if (location.value.trim().length < 2) {

            showError(
                "Please enter your location."
            );

            location.focus();

            return false;
        }

        if (password.value.length < 8) {

            showError(
                "Password must contain at least 8 characters."
            );

            password.focus();

            return false;
        }

        if (!checkPasswords()) {

            showError(
                "Passwords do not match."
            );

            confirmPassword.focus();

            return false;
        }

        if (!terms.checked) {

            showError(
                "Please accept the Terms of Service and Privacy Policy."
            );

            return false;
        }

        return true;
    }


    /* =====================================================
       ERROR MESSAGE
    ===================================================== */

    function showError(text) {

        message.textContent = text;

        message.className =
            "register-message error";
    }


    /* =====================================================
       REGISTER — REAL BACKEND CONNECTION
    ===================================================== */

    form.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            if (!validateForm()) {
                return;
            }

            registerButton.disabled = true;

            registerButton.textContent =
                "Creating Account...";


            /*
             * IMPORTANT:
             * Your backend users table currently does NOT
             * have a location column.
             *
             * Therefore location is collected by the UI
             * but is NOT sent to the registration API yet.
             */

            const userData = {

    full_name:
        fullName.value.trim(),

    email:
        email.value.trim(),

    phone:
        phone.value.trim(),

    password:
        password.value

};


            try {

                const response = await fetch(
                    "http://localhost:5000/api/auth/register",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify(userData)
                    }
                );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Registration failed."
                    );
                }


                console.log(
                    "Registration successful:",
                    data
                );


                message.textContent =
                    "Account created successfully. Redirecting to login...";

                message.className =
                    "register-message success";


                form.reset();

                strengthBar.style.width = "0%";

                strengthText.textContent =
                    "At least 8 characters";

                passwordMatch.textContent = "";


                setTimeout(() => {

                    window.location.href =
                        "login.html";

                }, 1200);


            } catch (error) {

                console.error(
                    "Registration error:",
                    error
                );


                showError(
                    error.message ||
                    "Unable to create your account."
                );


                registerButton.disabled =
                    false;

                registerButton.textContent =
                    "Create Account";
            }

        }
    );


    console.log(
        "NEXUS registration initialized."
    );

});