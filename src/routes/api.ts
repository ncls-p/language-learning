import express from "express";
import { TranslationController } from "../controllers/translationController";
import { AudioController } from "../interfaces/controllers/AudioController";
import { ChatbotController } from "../interfaces/controllers/ChatbotController";
import { ExerciseController } from "../interfaces/controllers/ExerciseController";
import { SentenceController } from "../interfaces/controllers/SentenceController";
import { VocabularyController } from "../interfaces/controllers/VocabularyController";

const router = express.Router();

const sentenceController = new SentenceController();
const exerciseController = new ExerciseController();
const audioController = new AudioController();
const translationController = new TranslationController();
const chatbotController = new ChatbotController();
const vocabularyController = new VocabularyController();

router.post("/generate-sentence", sentenceController.generateSentence);
router.post("/correct-exercise", exerciseController.correctExercise);
router.post("/generate-exercise", exerciseController.generateExercise);
router.post("/text-to-speech", audioController.textToSpeech);
router.post("/translate", translationController.translate);
router.post("/translate-word", translationController.translateWord);
router.post("/chatbot", chatbotController.chat);
router.post("/save-vocabulary", vocabularyController.saveVocabulary);

export default router;
