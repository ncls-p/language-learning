import fs from "fs/promises";
import path from "path";

export class VocabularyRepository {
  private filePath: string;

  constructor() {
    this.filePath = path.join(
      __dirname,
      "..",
      "..",
      "..",
      "public",
      "js",
      "vocabulary.json"
    );
  }

  public async save(vocabulary: any[]): Promise<void> {
    await fs.writeFile(this.filePath, JSON.stringify(vocabulary, null, 2));
  }
}
