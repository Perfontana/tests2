import { Exclude, Expose, Type } from 'class-transformer';
import { IsNotEmpty, IsOptional } from 'class-validator';

@Exclude()
export class CreatePostDTO {
  @Type(() => String)
  @Expose()
  @IsNotEmpty()
  title: string;

  @Type(() => String)
  @Expose()
  @IsNotEmpty()
  text: string;

  @Type(() => String)
  @Expose()
  @IsOptional()
  tags?: string;
}
