import { OpenAIService } from '../../infrastructure/services/OpenAIService';

export class TranslateWordUseCase {
  private openAIService: OpenAIService;

  constructor() {
    this.openAIService = new OpenAIService();
  }

  public async execute(word: string, sourceLang: string, targetLang: string): Promise<string> {
    return this.openAIService.translateText(word, sourceLang, targetLang);
  }
}
