import axios from "axios";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = "IHngRooVccHyPqB4uQkG";
const MODEL_ID = "eleven_multilingual_v2";
const CHUNK_SIZE = 1024;

export async function textToSpeech(
  text: string,
  language: string
): Promise<string> {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`;
  const headers = {
    Accept: "audio/mpeg",
    "Content-Type": "application/json",
    "xi-api-key": ELEVENLABS_API_KEY,
  };
  const data = {
    text,
    model_id: MODEL_ID,
    voice_settings: {
      stability: 0.5,
      similarity_boost: 0.5,
    },
  };

  const response = await axios.post(url, data, {
    headers,
    responseType: "stream",
  });
  const outputDir = path.join(__dirname, "..", "public", "audio");
  const outputFilePath = path.join(outputDir, "output.mp3");

  // Create the directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const writer = fs.createWriteStream(outputFilePath);

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", () => resolve(outputFilePath));
    writer.on("error", reject);
  });
}
