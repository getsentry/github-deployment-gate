import {Column, ForeignKey, HasMany, Model, Table} from 'sequelize-typescript';

import Item from './Item.model';
import Organization from './Organization.model';
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

  // Delete the below fields

  @Column
  username: string;

  @HasMany(() => Item)
  items: Item[];

  @ForeignKey(() => Organization)
  @Column
  organizationId: number;
}
