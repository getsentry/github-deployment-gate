import { Column, ForeignKey, Model, Table } from 'sequelize-typescript';

import User from './User.model';

@Table({ tableName: 'github_repo', underscored: true, timestamps: false })
export default class GithubRepo extends Model {
  @Column({ primaryKey: true, autoIncrement: true })
  id: number;

  @Column
  name: string;

  @Column
  waitPeriodToCheckForIssue: number;

  @ForeignKey(() => User)
  @Column
  userId: number;

  @Column({ defaultValue: () => true })
  isActive: boolean;
}
