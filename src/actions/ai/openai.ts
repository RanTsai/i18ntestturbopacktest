// actions/openai.ts
//to disable
"use server";
import OpenAI from "openai";
 
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
 
export async function textOpenAi(message: string) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a helpful assistant for a image generator website. If user is asking about the image generation features, answer them in maximum 50 charater long reply. All you need to know is: This app is free to use at the start and can generate images using ai for free. users can download freely generated images. they must be logged in.",
      },
      {
        role: "user",
        content: message,
      },
    ],
    max_tokens: 1000,
  });
 
  console.log(completion.choices[0].message);
  return completion.choices[0].message.content;
}

export async function getThumbnailReviewFromOpenAi(message: string, imgUrl: string, title:string) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini", 
    messages: [
      {
        role: "system",
        content:
          "You are a thumbnail analyser, return your answer in this format:\n1. Overall Impression\n2. Title Strength\n3. Thumbnail Strength\n4. Synergy\n5. Suggestions",
      },
      {
        role: "user",
        content: [
          { type: "text", text: `${message}\n\nHere is the title: "${title}"\n\nPlease evaluate how well the title and image work together.`,           }, 
          {
            type: "image_url",
            image_url: {
              url: imgUrl,
            },
          },
        ],
      },
    ],
    max_tokens: 1000,
  });

  return completion.choices[0].message.content;
}
