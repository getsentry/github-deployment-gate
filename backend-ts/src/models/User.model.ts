import {Column, ForeignKey, HasMany, Model, Table} from 'sequelize-typescript';

import Item from './Item.model';
import Organization from './Organization.model';

@Table({tableName: 'user', underscored: true, timestamps: false})
export default class User extends Model {
  @Column
  name: string;

  @Column
  githubHandle: string;

  @Column
  refreshToken: string;

  // Delete the below fields

  @Column
  username: string;

  @Column
  avatar: string;

  @HasMany(() => Item)
  items: Item[];

  @ForeignKey(() => Organization)
  @Column
  organizationId: number;
}
