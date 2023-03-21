export class DeploymentRuleDTO {
  action: string;
  environment: string;
  event: string;
  deployment_callback_url: string;
  deployment: {
    id: number;
    node_id: string;
    task: string;
    environment: string;
    sha: string;
  };
  installation: {
    id: number;
    account: {
      login: string;
    };
  };
  repositories_removed: Array<{
    full_name: string;
  }>;
  repositories_added: Array<{
    full_name: string;
  }>;
  repository: {
    full_name: string;
    owner: {
      login: string;
      avatar_url: string;
    };
  };
  sender: {
    login: string;
  };
}

export enum DeploymentRuleAction {
  ADDED = 'added',
  REMOVED = 'removed',
  REQUESTED = 'requested',
}

export enum DeploymentProtectionRuleStatus {
  APPROVED = 'approved',
  REJECTED = 'rejected',
  REQUESTED = 'requested',
}
