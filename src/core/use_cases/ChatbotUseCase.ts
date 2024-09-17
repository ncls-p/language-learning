import { OpenAIService } from '../../infrastructure/services/OpenAIService';

export class ChatbotUseCase {
  private openAIService: OpenAIService;

  constructor() {
    this.openAIService = new OpenAIService();
  }

  public async execute(message: string, language: string): Promise<string> {
    return this.openAIService.generateChatResponse(message, language);
  }
}
