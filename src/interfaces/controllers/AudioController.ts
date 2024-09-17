import { Request, Response } from "express";
import { ElevenLabsService } from "../../infrastructure/services/ElevenLabsService";
import { IAudioController } from "./IAudioController";

export class AudioController implements IAudioController {
  private elevenLabsService: ElevenLabsService;

  constructor() {
    this.elevenLabsService = new ElevenLabsService();
  }

  public async textToSpeech(req: Request, res: Response): Promise<void> {
    const { text, language } = req.body;
    try {
      const audioUrl = await this.elevenLabsService.textToSpeech(
        text,
        language
      );
      res.json({ audioUrl });
    } catch (error) {
      console.error("Text-to-speech error:", error);
      res
        .status(500)
        .json({ error: "An error occurred during text-to-speech conversion" });
    }
  }
}
