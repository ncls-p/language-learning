import { Request, Response } from "express";
import { OpenAIService } from "../../infrastructure/services/OpenAIService";
import { ISentenceController } from "./ISentenceController";

export class SentenceController implements ISentenceController {
  private openAIService: OpenAIService;

  constructor() {
    this.openAIService = new OpenAIService();
  }

  public async generateSentence(req: Request, res: Response): Promise<void> {
    const { language } = req.body;
    try {
      const sentence = await this.openAIService.generateSentence(language);
      res.json({ sentence });
    } catch (error) {
      console.error("Generate sentence error:", error);
      res
        .status(500)
        .json({ error: "An error occurred while generating the sentence" });
    }
  }
}
