export class DeploymentRuleDTO {
  action: string;
  installation: {
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
  sender: {
    login: string;
  };
}

export enum DeploymentRuleAction {
  ADDED = 'added',
  REMOVED = 'removed',
  REQUESTED = 'requested',
}
