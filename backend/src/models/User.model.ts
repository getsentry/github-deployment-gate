import {Column, ForeignKey, HasMany, Model, Table} from 'sequelize-typescript';

import SentryInstallation from './SentryInstallation.model';

@Table({tableName: 'user', underscored: true, timestamps: false})
export default class User extends Model {
  @Column
  name: string;

  @Column
  githubHandle: string;

  @Column
  refreshToken: string;

  @Column
  avatar: string;

  @ForeignKey(() => SentryInstallation)
  @Column
  sentryInstallationId: number;
}
