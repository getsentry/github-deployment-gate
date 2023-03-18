import {Attributes} from 'sequelize';

import SentryInstallation from '../../src/models/SentryInstallation.model';
import {INSTALLATION} from '../mocks';
<<<<<<< HEAD
import createOrganization from './Organization.factory';
=======
>>>>>>> feature/sentry-integration

export default async function createSentryInstallation(
  fields: Partial<Attributes<SentryInstallation>> = {}
): Promise<SentryInstallation> {
<<<<<<< HEAD
  if (!fields.organizationId) {
    const organization = await createOrganization();
    fields.organizationId = organization.id;
  }
=======
>>>>>>> feature/sentry-integration
  return SentryInstallation.create({
    uuid: INSTALLATION.uuid,
    orgSlug: INSTALLATION.organization.slug,
    token: 'abcdef123456abcdef123456abcdef123456',
    refreshToken: 'abcdef123456abcdef123456abcdef123456',
    expiresAt: new Date(2200, 0, 1),
    ...fields,
  });
}
export {SentryInstallation};
