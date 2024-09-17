import { Request, Response } from "express";
import { TranslateTextUseCase } from "../core/use_cases/TranslateTextUseCase";
import { TranslateWordUseCase } from "../core/use_cases/TranslateWordUseCase";

export class TranslationController {
  private translateTextUseCase: TranslateTextUseCase;
  private translateWordUseCase: TranslateWordUseCase;

  constructor() {
    this.translateTextUseCase = new TranslateTextUseCase();
    this.translateWordUseCase = new TranslateWordUseCase();
  }

  public translate = async (req: Request, res: Response): Promise<void> => {
    const { text, sourceLang, targetLang } = req.body;
    try {
      const translation = await this.translateTextUseCase.execute(
        text,
        sourceLang,
        targetLang
      );
      res.json({ translation });
    } catch (error) {
      console.error("Translation error:", error);
      res.status(500).json({ error: "An error occurred during translation" });
    }
  };

  public translateWord = async (req: Request, res: Response): Promise<void> => {
    const { word, sourceLang, targetLang } = req.body;
    try {
      const translation = await this.translateWordUseCase.execute(
        word,
        sourceLang,
        targetLang
      );
      res.json({ translation });
    } catch (error) {
      console.error("Word translation error:", error);
      res
        .status(500)
        .json({ error: "An error occurred during word translation" });
    }
  };
}
