import { Request, Response } from "express";
import { OpenAIService } from "../../infrastructure/services/OpenAIService";
import { IExerciseController } from "./IExerciseController";

export class ExerciseController implements IExerciseController {
  private openAIService: OpenAIService;

  constructor() {
    this.openAIService = new OpenAIService();
  }

  public async generateExercise(req: Request, res: Response): Promise<void> {
    const { language, type } = req.body;
    try {
      const exercise = await this.openAIService.generateExercise(
        language,
        type
      );
      res.json({ exercise });
    } catch (error) {
      console.error("Generate exercise error:", error);
      res
        .status(500)
        .json({ error: "An error occurred while generating the exercise" });
    }
  }

  public async correctExercise(req: Request, res: Response): Promise<void> {
    const { exercise, language } = req.body;
    try {
      const correction = await this.openAIService.correctExercise(
        exercise,
        language
      );
      res.json({ correction });
    } catch (error) {
      console.error("Correct exercise error:", error);
      res
        .status(500)
        .json({ error: "An error occurred while correcting the exercise" });
    }
  }
}
