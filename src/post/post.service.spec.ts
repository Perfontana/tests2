import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

import { PostService } from './post.service';
import { Post } from './post.model';
import { postMock } from './mocks/post.mock';
import { PassThrough } from 'stream';

describe('PostService', () => {
  let service: PostService;
  const logStream = new PassThrough();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        WinstonModule.forRoot({
          // Stream transport is used, since File transport flushes logs inconsistently
          transports: [new winston.transports.Stream({ stream: logStream })],
        }),
      ],
      providers: [
        PostService,
        { provide: getModelToken(Post), useValue: postMock },
      ],
    }).compile();

    service = module.get<PostService>(PostService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return an array of posts', async () => {
    const result = await service.getPosts();

    expect(postMock.findAll).toBeCalledTimes(1);
    expect(result).toEqual(postMock.findAll());
  });

  it('should create a post', async () => {
    const authorId = 1;

    const file = {
      filename: 'filename',
    };

    const body = {
      text: 'text',
      title: 'title',
      tags: 'tag',
    };

    const result = await service.createPost(body, authorId, file as any);

    expect(postMock.create).toBeCalledTimes(1);
    expect(result).toHaveProperty('id');
    expect(result).toHaveProperty('authorId');
  });

  describe('Post updates', () => {
    it('should return error if post is not found', async () => {
      const authorId = 1;

      const body = {
        text: 'text',
        title: 'title',
        tags: 'tag',
      };

      await expect(
        service.updatePost('nonexistant_post_id', body, authorId),
      ).rejects.toThrow();
    });

    it('should return error if user is not the author', async () => {
      const authorId = 0;

      const originalPost = postMock.create({
        text: 'original',
        title: 'original',
        tags: 'original',
        authorId: 1,
      });

      const body = {
        text: 'text',
        title: 'title',
        tags: 'tag',
      };

      let log;
      const setLog = (data) => {
        log = data?.toString();
      };

      logStream.on('data', setLog);

      await expect(
        service.updatePost(originalPost.id, body, authorId),
      ).rejects.toThrow();

      expect(log).toMatch(`User ${authorId} tried to update post 1`);

      logStream.off('data', setLog);
    });

    it('should add image filename to post.image field', async () => {
      const authorId = 1;

      const originalPost = postMock.create({
        text: 'original',
        title: 'original',
        tags: 'original',
        authorId,
      });

      const file = {
        filename: 'newFileName',
      };

      const body = {
        text: 'text',
        title: 'title',
        tags: 'tag',
      };

      const result = await service.updatePost(
        originalPost.id,
        body,
        authorId,
        file as any,
      );

      expect(result).toEqual({
        ...body,
        authorId,
        id: originalPost.id,
        image: file.filename,
      });
    });
  });
});
