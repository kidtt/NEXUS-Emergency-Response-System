const { spawn } = require("child_process");
const path = require("path");

const predictWithML = (incident) => {
    return new Promise((resolve, reject) => {

        const pythonPath = path.join(
            __dirname,
            "../../ml-env/Scripts/python.exe"
        );

        const scriptPath = path.join(
            __dirname,
            "../../ml/predict.py"
        );

        const pythonProcess = spawn(
            pythonPath,
            [scriptPath]
        );

        let output = "";
        let errorOutput = "";

        pythonProcess.stdout.on("data", (data) => {
            output += data.toString();
        });

        pythonProcess.stderr.on("data", (data) => {
            errorOutput += data.toString();
        });

        pythonProcess.on("close", (code) => {

            if (code !== 0) {
                console.error("ML Error:", errorOutput);

                return reject(
                    new Error("ML prediction failed")
                );
            }

            try {
                const result = JSON.parse(output);

                resolve(result);

            } catch (error) {
                console.error(
                    "Invalid ML response:",
                    output
                );

                reject(
                    new Error(
                        "Invalid response from ML model"
                    )
                );
            }
        });

        // Send incident data to Python
        pythonProcess.stdin.write(
            JSON.stringify(incident)
        );

        pythonProcess.stdin.end();
    });
};

module.exports = {
    predictWithML
};