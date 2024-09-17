import { Request, Response } from "express";
import { correctExercise, generateExercise } from "../services/openai";

export async function correctExerciseHandler(req: Request, res: Response) {
  const { exercise, language, isDyslexicMode } = req.body;
  try {
    const correction = await correctExercise(exercise, language);
    const formattedCorrection = isDyslexicMode
      ? formatTextForDyslexia(correction)
      : correction;
    res.json({ correction: formattedCorrection });
  } catch (error) {
    console.error("Exercise correction error:", error);
    res
      .status(500)
      .json({ error: "An error occurred while correcting the exercise" });
  }
}

export async function generateExerciseHandler(req: Request, res: Response) {
  const { language, type, isDyslexicMode } = req.body;
  try {
    const exercise = await generateExercise(language, type);
    const formattedExercise = isDyslexicMode
      ? formatTextForDyslexia(exercise)
      : exercise;
    res.json({ exercise: formattedExercise });
  } catch (error) {
    console.error("Exercise generation error:", error);
    res
      .status(500)
      .json({ error: "An error occurred while generating the exercise" });
  }
}

function formatTextForDyslexia(text: string): string {
  // Add line breaks after punctuation
  text = text.replace(/([.!?])\s+/g, "$1<br><br>");

  // Highlight important words or phrases
  text = text.replace(
    /\b(important|key|main|crucial)\b/gi,
    "<strong>$1</strong>"
  );

  // Add visual separators between words
  text = text.split(" ").join(" | ");

  return text;
}
