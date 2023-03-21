import {Column, ForeignKey, Model, Table} from 'sequelize-typescript';
import {DeploymentProtectionRuleStatus} from '../dto/DeploymentRule.dto';
import GithubRepo from './GithubRepo.model';

@Table({
  tableName: 'deployment_protection_rule_request',
  underscored: true,
  timestamps: false,
})
export default class DeploymentProtectionRuleRequest extends Model {
  @Column
  status: DeploymentProtectionRuleStatus;

  @Column
  installationId: number;

  @Column
  deploymentCallbackUrl: string;

  @Column
  sha: string;

  @ForeignKey(() => GithubRepo)
  @Column
  githubRepoId: number;
}
