const axios = require("axios");

const MODELS = [

    "deepseek/deepseek-chat-v3-0324",

    "qwen/qwen3-235b-a22b",

    "meta-llama/llama-3.3-70b-instruct"

];

async function askUniSphere(question){

    const systemPrompt = `

You are UniSphere AI.

You are the Official Academic Assistant of JIS University.

Rules:

- Answer only university related questions.
- Reply in the same language as the user.
- If the user writes in Banglish, reply in Banglish.
- If information is unavailable, clearly say that the exact information is not available in the University Knowledge Base.
- Suggest the correct office if needed (Admission Cell, Examination Cell, Accounts Office, Library, Placement Cell, HOD, Faculty Coordinator).
- Never invent room numbers, dates, holidays or university policies.
- Keep answers professional, concise and student-friendly.

`;

    for(const model of MODELS){

        try{

            console.log("🤖 Trying :",model);

            const response = await axios.post(

                "https://openrouter.ai/api/v1/chat/completions",

                {

                    model,

                    messages:[

                        {
                            role:"system",
                            content:systemPrompt
                        },

                        {
                            role:"user",
                            content:question
                        }

                    ],

                    temperature:0.4

                },

                {

                    headers:{

                        Authorization:`Bearer ${process.env.OPENROUTER_API_KEY}`,

                        "Content-Type":"application/json"

                    }

                }

            );

            console.log("✅ Success :",model);

            return response.data.choices[0].message.content;

        }

        catch(err){

            console.log("❌ Failed :",model);

        }

    }

    return `

I couldn't retrieve an AI response at the moment.

Please try again later.

If your question is related to:

• Admission → Admission Cell

• Examination → Examination Cell

• Holiday → Holiday List (Quick Access)

• Academic Schedule → Academic Calendar (Quick Access)

• Placement → Placement Cell

• Library → Central Library

• Fees → Accounts Office

• Department → Faculty Coordinator / HOD

`;

}

module.exports = askUniSphere;