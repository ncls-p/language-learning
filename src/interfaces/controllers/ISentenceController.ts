import { Request, Response } from "express";

export interface ISentenceController {
  generateSentence(req: Request, res: Response): Promise<void>;
}
