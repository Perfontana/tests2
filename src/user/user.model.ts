import { DataTypes } from 'sequelize';
import {
  BeforeSave,
  Column,
  HasMany,
  Model,
  Table,
  Scopes,
  DefaultScope,
} from 'sequelize-typescript';
import { Post } from '../post/post.model';
import * as bcrypt from 'bcrypt';

@DefaultScope(() => ({
  attributes: {
    exclude: ['password'],
  },
}))
@Scopes(() => ({
  withPosts: {
    include: [Post],
    attributes: {
      exclude: ['password'],
    },
  },
  withPassword: {},
}))
@Table({ tableName: 'users', timestamps: true })
export class User extends Model {
  @Column({
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  })
  username: string;

  @Column({
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  })
  password: string;

  @Column({
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  })
  email: string;

  @Column({ type: DataTypes.STRING })
  avatar: string;

  @HasMany(() => Post, { foreignKey: 'authorId' })
  posts: Post[];

  @BeforeSave
  static async hashPassword(user: User) {
    if (user.changed('password')) {
      user.password = await bcrypt.hash(user.password, 10);
    }
  }
}
