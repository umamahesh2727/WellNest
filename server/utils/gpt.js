import OpenAI from "openai";

export const askGPT = async (messages) => {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages,
    temperature: 0.7,
  });
  
  return completion.choices[0].message.content;
};
