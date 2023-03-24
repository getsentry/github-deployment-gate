import {Column, ForeignKey, Model, Table} from 'sequelize-typescript';

import SentryInstallation from './SentryInstallation.model';
import User from './User.model';

@Table({tableName: 'github_repo', underscored: true, timestamps: false})
export default class GithubRepo extends Model {
  @Column
  name: string;

  @Column
  sentryProjectSlug: string;

  @Column
  waitPeriodToCheckForIssue: number;

  @ForeignKey(() => User)
  @Column
  userId: number;

  @Column({defaultValue: () => true})
  isActive: boolean;
}
