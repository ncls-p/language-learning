import { Request, Response } from "express";

export interface IExerciseController {
  generateExercise(req: Request, res: Response): Promise<void>;
  correctExercise(req: Request, res: Response): Promise<void>;
}
