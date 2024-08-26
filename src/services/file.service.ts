import { Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import { DateTime } from 'luxon';
import { readFileSync } from 'fs';
import { join } from 'path';

@Injectable()
export class FileService {
  async fileToJson(
    file: Express.Multer.File,
    isHeader: boolean,
  ): Promise<object[]> {
    try {
      const filePath = this.getFilename(file);
      const fileBuffer = readFileSync(filePath);
      const workbook = XLSX.read(fileBuffer, {
        type: 'buffer',
        cellDates: true,
        dateNF: 'yyyy-mm-dd',
      });

      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      let opts = {};
      if (!isHeader) {
        // header가 없는 경우, 열 순서로 Mapping
        opts = { header: 1, defval: '' };
      }

      return XLSX.utils.sheet_to_json(firstSheet, opts) as object[];
    } catch (error) {
      console.error('Error processing file:', error);
      throw new Error('Failed to import file');
    }
  }

  async moveFile(
    file: Express.Multer.File,
    domain: string,
    work: string,
  ): Promise<void> {
    const filePath = this.getFilename(file);
    if (!fs.existsSync(filePath)) {
      console.error('No file exists for moving.');
    }

    try {
      const newPath = `./uploads/${domain}/${work}/${DateTime.now().toFormat('yyyyMMdd')}`;
      const newDest = join(newPath, file.filename);

      if (!fs.existsSync(newPath)) {
        fs.mkdirSync(newPath, { recursive: true });
      }

      fs.renameSync(filePath, newDest);
    } catch (error) {
      console.error('Error moving file:', error);
      throw new Error('Failed to moving file');
    }
  }

  getFilename(file: Express.Multer.File): string {
    return join(process.cwd(), file.destination, file.filename);
  }
}
