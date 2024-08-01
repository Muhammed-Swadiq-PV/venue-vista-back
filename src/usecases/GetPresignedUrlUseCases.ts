// src/usecases/GetPresignedUrlUseCases.ts
import { generateUploadPresignedUrl, generateDownloadPresignedUrl } from '../services/s3Services';

export class GetPresignedUrlUseCase {
  async execute(fileName: string, fileType: string, operation: 'upload' | 'download', expiresIn: number = 60): Promise<string> {
    if (!fileName || !fileType || !operation) {
      throw new Error('File name, type, and operation must be provided');
    }

    const validUploadFileTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    const validDownloadFileTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

    if (operation === 'upload' && !validUploadFileTypes.includes(fileType)) {
      throw new Error('Invalid file type for upload');
    }
    if (operation === 'download' && !validDownloadFileTypes.includes(fileType)) {
      throw new Error('Invalid file type for download');
    }

    if (operation === 'upload') {
      return generateUploadPresignedUrl(fileName, expiresIn);
    } else if (operation === 'download') {
      return generateDownloadPresignedUrl(fileName, expiresIn);
    } else {
      throw new Error('Invalid operation type');
    }
  }
}
