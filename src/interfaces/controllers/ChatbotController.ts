import { Request, Response } from "express";
import { OpenAIService } from "../../infrastructure/services/OpenAIService";
import { IChatbotController } from "./IChatbotController";

export class ChatbotController implements IChatbotController {
  private openAIService: OpenAIService;

  constructor() {
    this.openAIService = new OpenAIService();
  }

  public async chat(req: Request, res: Response): Promise<void> {
    const { message, language } = req.body;
    try {
      const response = await this.openAIService.generateChatResponse(
        message,
        language
      );
      res.json({ response });
    } catch (error) {
      console.error("Chatbot error:", error);
      res
        .status(500)
        .json({ error: "An error occurred during the chat interaction" });
    }
  }
}
