import { Column, ForeignKey, Model, Table } from 'sequelize-typescript';

import { DeploymentProtectionRuleStatus } from '../types/DeploymentRule.dto';
import GithubRepo from './GithubRepo.model';

@Table({
  tableName: 'deployment_protection_rule_request',
  underscored: true,
  timestamps: false,
})
export default class DeploymentProtectionRuleRequest extends Model {
  @Column({ primaryKey: true, autoIncrement: true })
  id: number;

  @Column
  status: DeploymentProtectionRuleStatus;

  @Column
  installationId: number;

  @Column
  deploymentCallbackUrl: string;

  @Column
  environment: string;

  @Column
  sha: string;

  @Column
  createdAt: Date;

  @ForeignKey(() => GithubRepo)
  @Column
  githubRepoId: number;
}
