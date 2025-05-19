"use server"

const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
} = require("@google/generative-ai");
//   const fs = require("node:fs");
//   const mime = require("mime-types");

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function runGeminiAI(message: string) {
    const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
    });

    const generationConfig = {
        temperature: 1,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
        responseModalities: [
        ],
        responseMimeType: "text/plain",
    };


    const chatSession = model.startChat({
        generationConfig,
        history: [
            {
                role: 'user',
                parts: [{
                    text: "You are a helpful assistant for an image generator website. If the user is asking about the image generation features, you answer them in maximum 50 character long reply. All you need to know is: This app is free to use at the start and can generate images using ai for free. Users can download freely generated images once they log in.",
                },
                ],
            },
            {
                role: 'model',
                parts: [{
                    text: "Free AI image generation, download your creations! \n Login required. \n",
                },
                ],
            },
        ],
    });

    const result = await chatSession.sendMessage(message);
    const response = result.response;

    // TODO: Following code needs to be updated for client-side apps.
    // const candidates = result.response.candidates;
    // for(let candidate_index = 0; candidate_index < candidates.length; candidate_index++) {
    //   for(let part_index = 0; part_index < candidates[candidate_index].content.parts.length; part_index++) {
    //     const part = candidates[candidate_index].content.parts[part_index];
    //     if(part.inlineData) {
    //       try {
    //         const filename = `output_${candidate_index}_${part_index}.${mime.extension(part.inlineData.mimeType)}`;
    //         fs.writeFileSync(filename, Buffer.from(part.inlineData.data, 'base64'));
    //         console.log(`Output written to: ${filename}`);
    //       } catch (err) {
    //         console.error(err);
    //       }
    //     }
    //   }
    // }
    console.log(result.response.text());
    return response.text();
}

