const pool = require("./database");

const ensureOperationsTable = async () => {
    await pool.execute(`
        CREATE TABLE IF NOT EXISTS operations (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(150) NOT NULL,
            operation_type VARCHAR(80) NOT NULL,
            location_name VARCHAR(255),
            priority ENUM('LOW','MEDIUM','HIGH','CRITICAL') NOT NULL DEFAULT 'MEDIUM',
            status ENUM('ACTIVE','STANDBY','COMPLETED','CANCELLED') NOT NULL DEFAULT 'ACTIVE',
            created_by INT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_operations_status (status),
            INDEX idx_operations_created_at (created_at)
        )
    `);
};

module.exports = ensureOperationsTable;
