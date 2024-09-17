import { OpenAIService } from '../../infrastructure/services/OpenAIService';

export class GenerateSentenceUseCase {
  private openAIService: OpenAIService;

  constructor() {
    this.openAIService = new OpenAIService();
  }

  public async execute(language: string): Promise<string> {
    return this.openAIService.generateSentence(language);
  }
}
