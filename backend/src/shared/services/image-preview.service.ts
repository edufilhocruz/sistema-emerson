import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class ImagePreviewService {
  private uploadDir = path.join(__dirname, '../../uploads/images');

  constructor() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async saveAndGeneratePreview(file: Express.Multer.File) {
    // Nome único
    const fileName = `${uuidv4()}${path.extname(file.originalname)}`;
    const filePath = path.join(this.uploadDir, fileName);

    // Salva fisicamente
    fs.writeFileSync(filePath, file.buffer);

    // CID para envio final
    const cid = `cid:${fileName}@app`;

    // URL temporária para preview
    const previewUrl = `/uploads/images/${fileName}`;

    return {
      cid,
      previewUrl,
      originalName: file.originalname,
      savedAs: fileName
    };
  }
}
