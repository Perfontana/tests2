import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';

import { AuthModule } from './auth/auth.module';
import { Post } from './post/post.model';
import { PostModule } from './post/post.module';
import { User } from './user/user.model';

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
    AuthModule,
    PostModule,
  ],
})
export class AppModule {}
