import { VocabularyRepository } from '../../infrastructure/repositories/VocabularyRepository';

export class SaveVocabularyUseCase {
  private vocabularyRepository: VocabularyRepository;

  constructor() {
    this.vocabularyRepository = new VocabularyRepository();
  }

  public async execute(vocabulary: any[]): Promise<void> {
    await this.vocabularyRepository.save(vocabulary);
  }
}
