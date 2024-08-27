import { Test, TestingModule } from '@nestjs/testing';
import { PostService } from './post.service';
import { getModelToken } from '@nestjs/sequelize';
import { Post } from './post.model';
import { postMock } from './mocks/post.mock';

describe('PostService', () => {
  let service: PostService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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
    const authorId = 'userId';

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
      const authorId = 'userId';

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
      const authorId = 'wrong_user_id';

      const body = {
        text: 'text',
        title: 'title',
        tags: 'tag',
      };

      await expect(service.updatePost('1', body, authorId)).rejects.toThrow();
    });

    it('should add image filename to post.image field', async () => {
      const authorId = '1';

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
