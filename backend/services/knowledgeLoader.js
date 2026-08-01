const fs = require("fs");
const path = require("path");

// ==============================
// Load All University Knowledge
// ==============================

function loadUniversityKnowledge() {

    const knowledgeFolder = path.join(
        __dirname,
        "../knowledge"
    );

    if (!fs.existsSync(knowledgeFolder)) {
        return "";
    }

    const files = fs.readdirSync(knowledgeFolder);

    let knowledge = "";

    files.forEach(file => {

        if (file.endsWith(".txt")) {

            knowledge += "\n\n";

            knowledge +=
                fs.readFileSync(
                    path.join(knowledgeFolder, file),
                    "utf8"
                );

        }

    });

    return knowledge;

}

module.exports = loadUniversityKnowledge;