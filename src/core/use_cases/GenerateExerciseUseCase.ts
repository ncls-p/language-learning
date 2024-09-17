import { OpenAIService } from '../../infrastructure/services/OpenAIService';

export class GenerateExerciseUseCase {
  private openAIService: OpenAIService;

  constructor() {
    this.openAIService = new OpenAIService();
  }

  public async execute(language: string, type: string): Promise<string> {
    return this.openAIService.generateExercise(language, type);
  }
}
