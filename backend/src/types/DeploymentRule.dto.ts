export interface DeploymentRuleDTO {
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
      avatar_url: string;
    };
  };
  repositories: Array<{
    full_name: string;
  }>;
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
  CREATED = 'created',
  REMOVED = 'removed',
  DELETED = 'deleted',
  REQUESTED = 'requested',
}

export enum DeploymentProtectionRuleStatus {
  APPROVED = 'approved',
  REJECTED = 'rejected',
  REQUESTED = 'requested',
}

export interface SentyReleaseResponseDTO {
  id: number;
  version: string;
  status: string;
  versionInfo: {
    package: string;
    version: {
      raw: string;
    };
  };
  newGroups: number;
}

export interface RespondToGithubProtectionRuleDTO {
  state: string;
  comment: string;
  environment_name?: string;
}
