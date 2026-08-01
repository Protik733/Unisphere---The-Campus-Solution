const fs = require("fs");
const path = require("path");

function loadKnowledge() {

    const knowledgeFolder = path.join(
        __dirname,
        "../data/knowledge"
    );

    const files = fs.readdirSync(knowledgeFolder);

    let knowledge = "";

    files.forEach(file => {

        if(file.endsWith(".json")){

            const filePath = path.join(
                knowledgeFolder,
                file
            );

            const content = fs.readFileSync(
                filePath,
                "utf8"
            );

            knowledge += `

==========================
FILE : ${file}
==========================

${content}

`;

        }

    });

    return knowledge;

}

module.exports = loadKnowledge;