export const MOCK_GITHUB_REPO_DELETED = {
  action: 'deleted',
  installation: {
    id: 35358448,
    account: {
      login: 'johndoe',
      avatar_url: 'https://avatars.githubusercontent.com/u/45549092?v=4',
    },
  },
  repositories: [
    {
      full_name: 'johndoe/test-repo',
    },
  ],
  sender: {
    login: 'johndoe',
  },
};

export const MOCK_GITHUB_REPO_REMOVED = {
  action: 'removed',
  installation: {
    id: 35358448,
    account: {
      login: 'johndoe',
      avatar_url: 'https://avatars.githubusercontent.com/u/45549092?v=4',
    },
  },
  repositories_removed: [
    {
      full_name: 'johndoe/test-repo',
    },
  ],
  sender: {
    login: 'johndoe',
  },
};

export const MOCK_GITHUB_REPO_CREATED = {
  action: 'created',
  installation: {
    id: 35358448,
    account: {
      login: 'johndoe',
      avatar_url: 'https://avatars.githubusercontent.com/u/45549092?v=4',
    },
  },
  repositories: [
    {
      full_name: 'johndoe/test-repo',
    },
  ],
  sender: {
    login: 'johndoe',
  },
};

export const MOCK_GITHUB_REPO_ADDED = {
  action: 'added',
  installation: {
    id: 35358448,
    account: {
      login: 'johndoe',
      avatar_url: 'https://avatars.githubusercontent.com/u/45549092?v=4',
    },
  },
  repositories_added: [
    {
      full_name: 'johndoe/test-repo',
    },
  ],
  sender: {
    login: 'johndoe',
  },
};

export const MOCK_GITHUB_DEPLOY_REQUESTED = {
  action: 'requested',
  environment: 'production',
  deployment_callback_url:
    'https://api.github.com/repos/johndoe/test-repo/actions/runs/4525744960/deployment_protection_rule',
  deployment: {
    sha: '20c168f8f323cad278fb7b4d10f8e31d7dbb9351',
  },
  installation: {
    id: 35358448,
    account: {
      login: 'johndoe',
      avatar_url: 'https://avatars.githubusercontent.com/u/45549092?v=4',
    },
  },
  repository: {
    full_name: 'johndoe/test-repo',
    owner: {
      login: 'johndoe',
      avatar_url: 'https://avatars.githubusercontent.com/u/45549092?v=4',
    },
  },
};
