import { OpenAIService } from '../../infrastructure/services/OpenAIService';

export class CorrectExerciseUseCase {
  private openAIService: OpenAIService;

  constructor() {
    this.openAIService = new OpenAIService();
  }

  public async execute(exercise: string, language: string): Promise<string> {
    return this.openAIService.correctExercise(exercise, language);
  }
}
