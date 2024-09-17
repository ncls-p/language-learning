import { Request, Response } from "express";

export interface IVocabularyController {
  saveVocabulary(req: Request, res: Response): Promise<void>;
}
