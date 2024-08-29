import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { JwtGuard } from '../auth/jwt.guard';
import { User } from '../auth/user.decorator';
import { FileUpload } from '../util/file-upload.interceptor';
import { CreatePostDTO } from './dto/create-post.dto';
import { UpdatePostDTO } from './dto/update-post.dto';
import { PostService } from './post.service';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get()
  public getPosts() {
    return this.postService.getPosts();
  }

  @Post()
  @UseInterceptors(FileUpload('image'))
  @UseGuards(JwtGuard)
  public createPost(
    @User('id') userId: number,
    @Body() body: CreatePostDTO,
    @UploadedFile()
    image?: Express.Multer.File | null,
  ) {
    return this.postService.createPost(body, userId, image);
  }

  @Patch(':id')
  @UseInterceptors(FileUpload('image'))
  @UseGuards(JwtGuard)
  public updatePost(
    @User('id') userId: number,
    @Param('id')
    postId: string,
    @UploadedFile()
    image: Express.Multer.File,
    @Body() body: UpdatePostDTO,
  ) {
    return this.postService.updatePost(postId, body, userId, image);
  }
}
