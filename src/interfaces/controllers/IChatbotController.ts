import { Request, Response } from "express";

export interface IChatbotController {
  chat(req: Request, res: Response): Promise<void>;
}
