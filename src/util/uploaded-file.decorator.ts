import {
  HttpStatus,
  UploadedFile as NestjsUploadedFile,
  ParseFilePipeBuilder,
} from '@nestjs/common';

export const UploadedFile = () =>
  NestjsUploadedFile(
    new ParseFilePipeBuilder()
      .addFileTypeValidator({
        fileType: /^image\/.*$/,
      })
      .build({
        errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        fileIsRequired: false,
      }),
  );
