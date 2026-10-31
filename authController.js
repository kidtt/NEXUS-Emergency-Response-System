const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/database");
const {
    isValidEmail,
    isValidPassword
} = require("../utils/validation");
// ===============================
// REGISTER
// ===============================
async function ensureAdmin() {
    const hash = await bcrypt.hash("Admin@12345", 10);

    await pool.execute(
        `INSERT INTO users
        (full_name, email, phone, password_hash, role, status)
        VALUES (?, ?, ?, ?, 'ADMIN', 'ACTIVE')
        ON DUPLICATE KEY UPDATE
            password_hash = VALUES(password_hash),
            role = 'ADMIN',
            status = 'ACTIVE'`,
        [
            "NEXUS Administrator",
            "admin@nexus.local",
            "",
            hash
        ]
    );

    console.log("🔥 ADMIN ACCOUNT READY");
}
const register = async (req, res) => {
    try {
        const {
            full_name,
            email,
            phone,
            password,
            role
        } = req.body;
if (!full_name || !email || !password) {
    return res.status(400).json({
        success: false,
        message: "Full name, email and password are required"
    });
}

if (!isValidEmail(email)) {
    return res.status(400).json({
        success: false,
        message: "Invalid email address"
    });
}

if (!isValidPassword(password)) {
    return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters"
    });
}
        if (!full_name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Full name, email and password are required"
            });
        }

        const [existingUser] = await pool.execute(
            "SELECT id FROM users WHERE email = ?",
            [email]
        );

        if (existingUser.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Email already registered"
            });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        // IMPORTANT:
        // New registrations are citizens by default.
        // Admin roles should be created/assigned securely later.

        const userRole = "CITIZEN";

        const [result] = await pool.execute(
            `INSERT INTO users
            (full_name, email, phone, password_hash, role)
            VALUES (?, ?, ?, ?, ?)`,
            [
                full_name,
                email,
                phone || null,
                passwordHash,
                userRole
            ]
        );

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: {
                id: result.insertId,
                full_name,
                email,
                role: userRole
            }
        });

    } catch (error) {
        console.error("Register error:", error);

        res.status(500).json({
            success: false,
            message: "Server error during registration"
        });
    }
};


// ===============================
// LOGIN
// ===============================

const login = async (req, res) => {
    try {
        const {
            email,
            password
        } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const [users] = await pool.execute(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const user = users[0];

        if (user.status !== "ACTIVE") {
            return res.status(403).json({
                success: false,
                message: "Account is not active"
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "24h"
            }
        );

        return res.json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user.id,
                full_name: user.full_name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error during login"
        });
    }
};
module.exports = {
    register,
    login
};