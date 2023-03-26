import { Column, ForeignKey, Model, Table } from 'sequelize-typescript';

import User from './User.model';

@Table({ tableName: 'sentry_installation', underscored: true, timestamps: false })
export default class SentryInstallation extends Model {
  @Column({ primaryKey: true, autoIncrement: true })
  id: number;

  @Column
  uuid: string;

  @Column
  orgSlug: string;

  @Column
  token: string;

  @Column
  refreshToken: string;

  @Column
  expiresAt: Date;

  @ForeignKey(() => User)
  @Column
  userId: number;

  @Column({ defaultValue: () => new Date() })
  createdAt: Date;
}
