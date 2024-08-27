import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

export const FileUpload = (fieldName: string) =>
  FileInterceptor(fieldName, {
    storage: diskStorage({
      destination: './public',
      filename: (req, file, cb) => {
        console.log(file, 'SUPERFILE');
        const filename = `${Date.now().toString()}-${file.originalname.replace(
          /\s/g,
          '',
        )}`;
        cb(null, filename);
      },
    }),
  });
