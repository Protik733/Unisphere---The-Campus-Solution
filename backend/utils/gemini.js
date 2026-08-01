const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const MODELS = [
    "gemini-2.5-flash-lite",
    "gemini-2.5-pro",
    "gemini-2.0-flash"
];

async function askGemini(prompt){

    let lastError;

    for(const modelName of MODELS){

        try{

            console.log(`🤖 Trying ${modelName}`);

            const model = genAI.getGenerativeModel({
                model: modelName
            });

            const result = await model.generateContent(prompt);

            return result.response.text();

        }catch(err){

            console.log(`❌ ${modelName} failed`);

            lastError = err;

        }

    }

    throw lastError;

}

module.exports = askGemini;