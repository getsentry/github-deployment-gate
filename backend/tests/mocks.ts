export const UUID = '7a485448-a9e2-4c85-8a3c-4f44175783c9';

export const INSTALLATION = {
  app: {
    uuid: '64bf2cf4-37ca-4365-8dd3-6b6e56d741b8',
    slug: 'app',
  },
  organization: {
    slug: 'example',
  },
  uuid: UUID,
};

export const ISSUE = {
  id: '123',
  shortId: 'IPE-1',
  title: 'Error #1: This is a test error!',
  culprit: 'SentryCustomError(frontend/src/util)',
  level: 'error',
  status: 'unresolved',
  statusDetails: {},
  isPublic: false,
  platform: 'javascript',
  project: {
    id: '456',
    name: 'ipe',
    slug: 'ipe',
    platform: 'javascript-react',
  },
  type: 'error',
  metadata: {
    value: 'This is a test error!',
    type: 'Another Error #1',
    filename: '/frontend/src/util.ts',
    function: 'SentryCustomError',
    display_title_with_tree_label: false,
  },
  numComments: 0,
  assignedTo: {
    email: 'person@example.com',
    type: 'user',
    id: '789',
    name: 'Person',
  },
  isBookmarked: false,
  isSubscribed: false,
  hasSeen: false,
  isUnhandled: false,
  count: '1',
  userCount: 1,
  firstSeen: '2022-04-04T18:17:18.320000Z',
  lastSeen: '2022-04-04T18:17:18.320000Z',
};

export const MOCK_SETUP = {
  postInstall: {
    code: 'installCode',
    installationId: UUID,
    sentryOrgSlug: 'example',
  },
  newToken: {
    token: 'abc123',
    refreshToken: 'def456',
    expiresAt: '3000-01-01T08:00:00.000Z',
  },
  installation: INSTALLATION,
};

const MOCK_INSTALLATION_CREATED_WEBHOOK = {
  action: 'created',
  data: { installation: INSTALLATION },
  installation: INSTALLATION,
};

const MOCK_INSTALLATION_DELETED_WEBHOOK = {
  action: 'deleted',
  data: { installation: INSTALLATION },
  installation: INSTALLATION,
};

export const MOCK_WEBHOOK = {
  'installation.deleted': MOCK_INSTALLATION_DELETED_WEBHOOK,
  'installation.created': MOCK_INSTALLATION_CREATED_WEBHOOK,
};