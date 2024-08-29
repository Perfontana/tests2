import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  Logger,
  Inject,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Post } from './post.model';
import { CreatePostDTO } from './dto/create-post.dto';
import { UpdatePostDTO } from './dto/update-post.dto';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post)
    private readonly postModel: typeof Post,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async getPosts() {
    return await this.postModel.findAll();
  }

  async createPost(
    data: CreatePostDTO,
    userId: number,
    file?: Express.Multer.File,
  ) {
    return await this.postModel.create({
      ...data,
      image: file?.filename,
      authorId: userId,
    });
  }

  async updatePost(
    postId: string,
    data: UpdatePostDTO,
    userId: number,
    file?: Express.Multer.File,
  ) {
    const post = await this.postModel.findOne({ where: { id: postId } });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.authorId !== userId) {
      this.logger.warn(`User ${userId} tried to update post ${postId}`);
      throw new ForbiddenException('Unauthorized');
    }

    await this.postModel.update(
      {
        ...data,
        image: file?.filename,
      },
      {
        where: {
          id: postId,
        },
      },
    );

    return this.postModel.findOne({ where: { id: postId } });
  }
}
