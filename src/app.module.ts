import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { WinstonModule } from 'nest-winston';

import { AuthModule } from './auth/auth.module';
import { Post } from './post/post.model';
import { PostModule } from './post/post.module';
import { User } from './user/user.model';
import * as winston from 'winston';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SequelizeModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get('DATABASE_URL'),
        models: [User, Post],
        synchronize: true,
      }),
    }),
    WinstonModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transports: [
          new winston.transports.File({
            dirname: join(__dirname, configService.get('LOG_DIRNAME')),
            filename: configService.get('LOG_FILENAME'),
          }),
        ],
      }),
    }),
    AuthModule,
    PostModule,
  ],
})
export class AppModule {}
