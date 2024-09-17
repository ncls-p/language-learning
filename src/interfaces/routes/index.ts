import express from "express";
import path from "path";
import { AudioController } from "../controllers/AudioController";
import { ChatbotController } from "../controllers/ChatbotController";
import { ExerciseController } from "../controllers/ExerciseController";
import { SentenceController } from "../controllers/SentenceController";
import { VocabularyController } from "../controllers/VocabularyController";
import { ApiRouter } from "./api";

export function setupRoutes(app: express.Application): void {
  app.use(express.static(path.join(__dirname, "..", "..", "public")));

  const apiRouter = new ApiRouter(
    new AudioController(),
    new ChatbotController(),
    new ExerciseController(),
    new SentenceController(),
    new VocabularyController()
  );

  app.use("/api", apiRouter.getRouter());

  app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "..", "views", "index.html"));
  });
}
