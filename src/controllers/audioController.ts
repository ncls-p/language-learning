import { Request, Response } from "express";
import { textToSpeech } from "../services/elevenlabs";

export async function textToSpeechHandler(req: Request, res: Response) {
  const text = req.body.text;
  const language = req.body.language || "English";
  const audioFilePath = await textToSpeech(text, language);
  const audioUrl = `/audio/output.mp3`;
  res.json({ audioUrl });
}
