import {Column, ForeignKey, Model, Table} from 'sequelize-typescript';
import GithubRepo from './GithubRepo.model';

@Table({
  tableName: 'deployment_protection_rule_request',
  underscored: true,
  timestamps: false,
})
export default class DeploymentProtectionRuleRequest extends Model {
  @Column
  status: string;

  @ForeignKey(() => GithubRepo)
  @Column
  githubRepoId: number;
}
