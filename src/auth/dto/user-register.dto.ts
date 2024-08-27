import { Exclude, Expose, Type } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

@Exclude()
export class UserRegisterDTO {
  @Type(() => String)
  @IsNotEmpty()
  @Expose()
  username: string;

  @Type(() => String)
  @IsNotEmpty()
  @Expose()
  email: string;

  @Type(() => String)
  @IsNotEmpty()
  @Expose()
  password: string;
}
