import {Column, ForeignKey, Model, Table} from 'sequelize-typescript';

@Table({tableName: 'sentry_installation', underscored: true, timestamps: false})
export default class SentryInstallation extends Model {
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
}
