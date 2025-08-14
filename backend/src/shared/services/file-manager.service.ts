import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FileManagerService {
  private uploadDir = path.join(__dirname, '../../uploads/images');

  constructor() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  saveFile(file: Express.Multer.File) {
    const fileName = `${uuidv4()}${path.extname(file.originalname)}`;
    const filePath = path.join(this.uploadDir, fileName);
    fs.writeFileSync(filePath, file.buffer);

    return {
      fileName,
      filePath,
      cid: `cid:${fileName}@app`
    };
  }

  /**
   * Remove uma imagem do sistema
   */
  async deleteImage(imageUrl: string): Promise<void> {
    try {
      if (!imageUrl) return;

      const fileName = path.basename(imageUrl);
      const filePath = path.join(this.uploadDir, fileName);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`✅ Imagem removida: ${fileName}`);
      }

    } catch (error) {
      console.error(`❌ Erro ao remover imagem: ${error.message}`);
    }
  }
}
