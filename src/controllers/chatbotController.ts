import { Request, Response } from "express";
import { generateChatResponse } from "../services/openai";

export async function chatbotHandler(req: Request, res: Response) {
  const { message, language } = req.body;
  try {
    const response = await generateChatResponse(message, language);
    res.json({ response });
  } catch (error) {
    console.error("Chatbot error:", error);
    res
      .status(500)
      .json({ error: "An error occurred while processing your message" });
  }
}
