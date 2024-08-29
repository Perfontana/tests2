import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { Post } from './post.model';
import { User } from '../user/user.model';
import { PostModule } from './post.module';
import { AuthModule } from '../auth/auth.module';
import { mockConfig } from '../testing/mock-config';
import { Sequelize } from 'sequelize-typescript';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { join } from 'path';
import { rm } from 'fs/promises';

const TEST_USER_EMAIL = 'TEST_USER_EMAIL@mail.com';
const TEST_USER_PASSWORD = 'USER_PASSWORD';
let testUserId: number;

let connection: Sequelize;
let server;

async function resetDatabase(connection: Sequelize): Promise<void> {
  await connection.sync({ force: true, match: /_test$/ });

  const user1 = await User.create({
    email: TEST_USER_EMAIL,
    username: 'user1',
    password: TEST_USER_PASSWORD,
  });

  testUserId = user1.id;

  const user2 = await User.create({
    email: 'user2@mail.com',
    username: 'user2',
    password: TEST_USER_PASSWORD,
  });

  await Post.bulkCreate([
    {
      title: 'post1',
      text: 'post1',
      authorId: user1.id,
      tags: 'post1',
    },
    {
      title: 'post2',
      text: 'post2',
      authorId: user2.id,
      tags: 'post2',
    },
  ]);
}

describe('PostController (e2e)', () => {
  let app: INestApplication;
  let token: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        SequelizeModule.forRootAsync({
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            uri: configService.get('DATABASE_URL'),
            models: [User, Post],
            logging: false,
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
        PostModule,
        AuthModule,
      ],
    })
      .overrideProvider(ConfigService)
      .useValue(mockConfig)
      .compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(new ValidationPipe());

    await app.init();

    connection = app.get(Sequelize);
    server = app.getHttpServer();

    await resetDatabase(connection);

    const response = await request(server)
      .post('/auth/login')
      .send({ email: TEST_USER_EMAIL, password: TEST_USER_PASSWORD });

    token = response.body.access_token;
  });

  afterAll(async () => {
    await app.close();
    await rm(join(__dirname, mockConfig.get('LOG_DIRNAME')), {
      recursive: true,
    });
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await resetDatabase(connection);
  });

  it('/posts GET', async () => {
    const response = await request(app.getHttpServer())
      .get('/posts')
      .expect(200);

    expect(response.body).toBeInstanceOf(Array);
  });

  describe('/posts POST', () => {
    it('should create a post', async () => {
      const createPostDto = {
        title: 'Test Post',
        text: 'This is a test post.',
      };

      const response = await request(app.getHttpServer())
        .post('/posts')
        .set('Authorization', `Bearer ${token}`)
        .send(createPostDto)
        .expect(201);

      expect(response.body).toHaveProperty('authorId');
      expect(response.body.authorId).toEqual(testUserId);
      expect(response.body.title).toEqual(createPostDto.title);
    });

    it('should reject unauthorized', async () => {
      const createPostDto = {
        title: 'Test Post',
        text: 'This is a test post.',
      };

      return request(app.getHttpServer())
        .post('/posts')
        .send(createPostDto)
        .expect(401);
    });

    it('should reject invalid body', async () => {
      const createPostDto = {
        text: 'This is a test post.',
      };

      const response = await request(app.getHttpServer())
        .post('/posts')
        .set('Authorization', `Bearer ${token}`)
        .send(createPostDto)
        .expect(400);

      expect(response.body.message).toBeInstanceOf(Array);
    });
  });

  describe('/posts/:id PATCH', () => {
    it('should update post', async () => {
      const updatePostDto = {
        title: 'Updated Test Post',
        text: 'This is an updated test post.',
      };

      const existingPost = await Post.create({
        title: 'initial',
        text: 'initial',
        authorId: testUserId,
      });

      const response = await request(app.getHttpServer())
        .patch(`/posts/${existingPost.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updatePostDto)
        .expect(200);

      expect(response.body).toHaveProperty('id', existingPost.id);
      expect(response.body.title).toEqual(updatePostDto.title);
    });

    it('should reject updates from other author', async () => {
      const updatePostDto = {
        title: 'Updated Test Post',
        text: 'This is an updated test post.',
      };

      const existingPost = await Post.create({
        title: 'initial',
        text: 'initial',
        authorId: testUserId + 1,
      });

      return request(app.getHttpServer())
        .patch(`/posts/${existingPost.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updatePostDto)
        .expect(403);
    });
  });
});
