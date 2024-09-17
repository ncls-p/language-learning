import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function openaiRequest(messages: any[]): Promise<string> {
  const response = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-4",
      messages: messages,
    },
    {
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
    }
  );
  return response.data.choices[0].message.content.trim();
}

export async function generateSentence(language: string): Promise<string> {
  const messages = [
    {
      role: "system",
      content: `You are a language tutor. Generate a sentence in ${language} that is suitable for language learners.`,
    },
    { role: "user", content: "Generate a sentence." },
  ];
  return openaiRequest(messages);
}

export async function correctExercise(
  exercise: string,
  language: string
): Promise<string> {
  const messages = [
    {
      role: "system",
      content: `You are a language tutor. Correct the following ${language} exercise and provide feedback: ${exercise}`,
    },
    {
      role: "user",
      content: "Please correct this exercise and provide feedback.",
    },
  ];
  return openaiRequest(messages);
}

export async function translateText(
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<string> {
  const messages = [
    {
      role: "system",
      content: `You are a translator. Translate the following text from ${sourceLang} to ${targetLang}: ${text}`,
    },
    { role: "user", content: "Please translate this text." },
  ];
  return openaiRequest(messages);
}

export async function generateChatResponse(
  message: string,
  language: string
): Promise<string> {
  const messages = [
    {
      role: "system",
      content: `You are a friendly language practice partner. Respond to the user's message in ${language}. Keep your responses relatively short and suitable for language learners.`,
    },
    { role: "user", content: message },
  ];
  return openaiRequest(messages);
}

export async function generateExercise(
  language: string,
  type: string
): Promise<string> {
  const messages = [
    {
      role: "system",
      content: `You are a language tutor. Generate a ${type} exercise in ${language} suitable for language learners. Include the correct answers. Format the exercise with proper line breaks and spacing for readability. Use HTML tags like <p>, <br>, and <ul> for structure.`,
    },
    { role: "user", content: `Generate a ${type} exercise.` },
  ];
  return openaiRequest(messages);
}
