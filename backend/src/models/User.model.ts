import { Column, ForeignKey, HasMany, Model, Table } from 'sequelize-typescript';

import SentryInstallation from './SentryInstallation.model';

@Table({ tableName: 'user', underscored: true, timestamps: false })
export default class User extends Model {
  @Column({ primaryKey: true, autoIncrement: true })
  id: number;

  @Column
  name: string;

  @Column
  githubHandle: string;

  @Column
  refreshToken: string;

  @Column
  avatar: string;
}
