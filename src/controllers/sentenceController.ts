import { Request, Response } from "express";
import { generateSentence } from "../services/openai";

export async function generateSentenceHandler(req: Request, res: Response) {
  const language = req.body.language || "English";
  try {
    const sentence = await generateSentence(language);
    res.json({ sentence });
  } catch (error) {
    console.error("Sentence generation error:", error);
    res
      .status(500)
      .json({ error: "An error occurred while generating the sentence" });
  }
}
