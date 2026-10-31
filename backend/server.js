require("dotenv").config();

const app = require("./src/app");
const ensureOperationsTable = require("./src/config/ensureSchema");

const PORT = process.env.PORT || 5000;

ensureOperationsTable()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`NEXUS server running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Failed to initialize database schema:", error);
        process.exit(1);
    });
