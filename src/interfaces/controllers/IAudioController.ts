import { Request, Response } from "express";

export interface IAudioController {
  textToSpeech(req: Request, res: Response): Promise<void>;
}
