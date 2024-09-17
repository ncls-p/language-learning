import { ElevenLabsService } from '../../infrastructure/services/ElevenLabsService';

export class TextToSpeechUseCase {
  private elevenLabsService: ElevenLabsService;

  constructor() {
    this.elevenLabsService = new ElevenLabsService();
  }

  public async execute(text: string, language: string): Promise<string> {
    return this.elevenLabsService.textToSpeech(text, language);
  }
}
