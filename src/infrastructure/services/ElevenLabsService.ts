import axios from "axios";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

export class ElevenLabsService {
  private ELEVENLABS_API_KEY: string;
  private VOICE_ID: string;
  private MODEL_ID: string;

  constructor() {
    this.ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || "";
    this.VOICE_ID = "IHngRooVccHyPqB4uQkG";
    this.MODEL_ID = "eleven_multilingual_v2";
  }

  public async textToSpeech(text: string, language: string): Promise<string> {
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${this.VOICE_ID}`;
    const headers = {
      Accept: "audio/mpeg",
      "Content-Type": "application/json",
      "xi-api-key": this.ELEVENLABS_API_KEY,
    };
    const data = {
      text,
      model_id: this.MODEL_ID,
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.5,
      },
    };

    const response = await axios.post(url, data, {
      headers,
      responseType: "stream",
    });
    const outputDir = path.join(__dirname, "..", "..", "public", "audio");
    const outputFilePath = path.join(outputDir, "output.mp3");

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const writer = fs.createWriteStream(outputFilePath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on("finish", () => resolve("/audio/output.mp3"));
      writer.on("error", reject);
    });
  }
}
