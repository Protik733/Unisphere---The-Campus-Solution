const askGemini = require("../utils/gemini");
const buildPrompt = require("../utils/geminiPrompt");
const loadKnowledge = require("../utils/knowledgeLoader");

async function askUniSphere(question) {

    try {

        const knowledge = loadKnowledge();

        const prompt = buildPrompt(
            question,
            knowledge
        );

        const answer = await askGemini(prompt);

        return answer;

    } 
catch (error) {

    console.error(error);

    throw error;

}
}

module.exports = askUniSphere;