import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { getModelToken } from '@nestjs/sequelize';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { Post } from './post.model';
import { postMock } from './mocks/post.mock';
import { PostModule } from './post.module';
import { AuthModule } from '../auth/auth.module';
import { User } from '../user/user.model';
import { userMock } from '../auth/mocks/user.mock';
import { mockConfig } from '../testing/mock-config';

describe('PostController (e2e)', () => {
  let app: INestApplication;
  let token: string;
  let user: { id: number };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        PostModule,
        AuthModule,
      ],
    })
      // Since real DB is not used, *Repository has to be overriden to resolve NestJS dependencies
      .overrideProvider('PostRepository')
      .useValue({})
      .overrideProvider('UserRepository')
      .useValue({})
      .overrideProvider(getModelToken(Post))
      .useValue(postMock)
      .overrideProvider(getModelToken(User))
      .useValue(userMock)
      .overrideProvider(ConfigService)
      .useValue(mockConfig)
      .compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(new ValidationPipe());

    await app.init();

    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ username: 'test', email: 'test@example.com', password: 'test' });

    token = response.body.access_token;
    user = userMock.findOne({ where: { username: 'test' } });
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => jest.clearAllMocks());

  it('/posts GET', () => {
    return request(app.getHttpServer())
      .get('/posts')
      .expect(200)
      .expect((res) => {
        expect(res.body).toBeInstanceOf(Array);
      });
  });

  describe('/posts POST', () => {
    it('should create a post', async () => {
      const createPostDto = {
        title: 'Test Post',
        text: 'This is a test post.',
      };

      return request(app.getHttpServer())
        .post('/posts')
        .set('Authorization', `Bearer ${token}`)
        .send(createPostDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('authorId');
          expect(res.body.authorId).toEqual(user.id);
          expect(res.body.title).toEqual(createPostDto.title);
        });
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

      return request(app.getHttpServer())
        .post('/posts')
        .set('Authorization', `Bearer ${token}`)
        .send(createPostDto)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toBeInstanceOf(Array);
        });
    });
  });

  describe('/posts/:id PATCH', () => {
    it('should update post', () => {
      const updatePostDto = {
        title: 'Updated Test Post',
        text: 'This is an updated test post.',
      };

      const existingPost = postMock.create({
        title: 'initial',
        text: 'initial',
        authorId: user.id,
      });

      return request(app.getHttpServer())
        .patch(`/posts/${existingPost.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updatePostDto)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', existingPost.id);
          expect(res.body.title).toEqual(updatePostDto.title);
        });
    });

    it('should reject updates from other author', () => {
      const updatePostDto = {
        title: 'Updated Test Post',
        text: 'This is an updated test post.',
      };

      const existingPost = postMock.create({
        title: 'initial',
        text: 'initial',
        authorId: 'not_the_user',
      });

      return request(app.getHttpServer())
        .patch(`/posts/${existingPost.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updatePostDto)
        .expect(403);
    });
  });
});
