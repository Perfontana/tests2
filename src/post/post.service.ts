import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Post } from './post.model';
import { CreatePostDTO } from './dto/create-post.dto';
import { UpdatePostDTO } from './dto/update-post.dto';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post)
    private readonly postModel: typeof Post,
  ) {}

  async getPosts() {
    return await this.postModel.findAll();
  }

  async createPost(
    data: CreatePostDTO,
    userId: string,
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
    userId: string,
    file?: Express.Multer.File,
  ) {
    const post = await this.postModel.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    if (post.authorId !== userId) {
      throw new ForbiddenException('Unauthorized');
    }
    return await this.postModel.update(
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
  }
}
