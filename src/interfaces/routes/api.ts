import { Router } from "express";
import { IAudioController } from "../controllers/IAudioController";
import { IChatbotController } from "../controllers/IChatbotController";
import { IExerciseController } from "../controllers/IExerciseController";
import { ISentenceController } from "../controllers/ISentenceController";
import { IVocabularyController } from "../controllers/IVocabularyController";

export class ApiRouter {
  private router: Router;

  constructor(
    private audioController: IAudioController,
    private chatbotController: IChatbotController,
    private exerciseController: IExerciseController,
    private sentenceController: ISentenceController,
    private vocabularyController: IVocabularyController
  ) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post("/text-to-speech", this.audioController.textToSpeech);
    this.router.post("/chat", this.chatbotController.chat);
    this.router.post(
      "/generate-exercise",
      this.exerciseController.generateExercise
    );
    this.router.post(
      "/correct-exercise",
      this.exerciseController.correctExercise
    );
    this.router.post(
      "/generate-sentence",
      this.sentenceController.generateSentence
    );
    this.router.post(
      "/save-vocabulary",
      this.vocabularyController.saveVocabulary
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
