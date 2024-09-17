import { Request, Response } from "express";
import { IVocabularyController } from "./IVocabularyController";
import { VocabularyRepository } from "../../infrastructure/repositories/VocabularyRepository";

export class VocabularyController implements IVocabularyController {
  private vocabularyRepository: VocabularyRepository;

  constructor() {
    this.vocabularyRepository = new VocabularyRepository();
  }

  public async saveVocabulary(req: Request, res: Response): Promise<void> {
    try {
      const vocabulary = req.body;
      await this.vocabularyRepository.save(vocabulary);
      res.json({ success: true });
    } catch (error) {
      console.error("Error saving vocabulary:", error);
      res
        .status(500)
        .json({ success: false, message: "Failed to save vocabulary" });
    }
  }
}
