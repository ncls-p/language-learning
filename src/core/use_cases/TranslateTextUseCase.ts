import { OpenAIService } from '../../infrastructure/services/OpenAIService';

export class TranslateTextUseCase {
  private openAIService: OpenAIService;

  constructor() {
    this.openAIService = new OpenAIService();
  }

  public async execute(text: string, sourceLang: string, targetLang: string): Promise<string> {
    return this.openAIService.translateText(text, sourceLang, targetLang);
  }
}
