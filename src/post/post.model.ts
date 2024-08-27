import { DataTypes } from 'sequelize';
import {
  BelongsTo,
  Column,
  DefaultScope,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from '../user/user.model';

@DefaultScope(() => ({
  include: [User],
}))
@Table({ tableName: 'posts', timestamps: true })
export class Post extends Model {
  @Column({
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  })
  title: string;

  @Column({
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  })
  text: string;

  @Column({ type: DataTypes.STRING })
  image: string;

  @ForeignKey(() => User)
  @Column({ type: DataTypes.STRING })
  authorId: string;

  @BelongsTo(() => User)
  author: User;

  @Column({ type: DataTypes.STRING })
  tags: string;
}
