import axios, { AxiosResponse, Method } from 'axios';

import { appConfig } from '../../config';
import SentryInstallation from '../../models/SentryInstallation.model';
import { handleAxiosError } from '../../utils/axios';
import { TokenResponseData } from './sentry.types';

export class SentryAPIClient {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  /**
   * Fetches an organization's Sentry API token, refreshing it if necessary.
   */
  static async getSentryAPIToken(sentryInstallationUUID: string) {
    const sentryInstallation = await SentryInstallation.findOne({
      where: { uuid: sentryInstallationUUID },
    }).then(resp => resp?.get());

    if (!sentryInstallation) {
      throw new Error(
        `Sentry installation not found for UUID: ${sentryInstallationUUID}`
      );
    }

    // If the token is not expired, no need to refresh it
    if (sentryInstallation.expiresAt.getTime() > Date.now()) {
      return sentryInstallation.token;
    }

    // If the token is expired, we'll need to refresh it...
    console.info(`Token for '${sentryInstallation.orgSlug}' has expired. Refreshing...`);
    // Construct a payload to ask Sentry for a new token
    const payload = {
      grant_type: 'refresh_token',
      refresh_token: sentryInstallation.refreshToken,
      client_id: appConfig.sentry.clientId,
      client_secret: appConfig.sentry.clientSecret,
    };

    // Send that payload to Sentry and parse the response
    const tokenResponse: { data: TokenResponseData } = await axios
      .post(
        `${appConfig.sentry.url}/api/0/sentry-app-installations/${sentryInstallation.uuid}/authorizations/`,
        payload
      )
      .catch(function (error) {
        console.log('Error in getSentryAPIToken');
        handleAxiosError(error);
        throw new Error(error.message);
      });

    // Store the token information for future requests
    const { token, refreshToken, expiresAt } = tokenResponse.data;
    const updatedSentryInstallation = await sentryInstallation.update({
      token,
      refreshToken,
      expiresAt: new Date(expiresAt),
    });
    console.info(`Token for '${updatedSentryInstallation.orgSlug}' has been refreshed.`);

    // Return the newly refreshed token
    return updatedSentryInstallation.token;
  }

  // We create static wrapper on the constructor to ensure our token is always refreshed
  static async create(sentryInstallationUUID: string) {
    const token = await SentryAPIClient.getSentryAPIToken(sentryInstallationUUID);
    return new SentryAPIClient(token);
  }

  public async request(
    method: Method,
    path: string,
    data?: object
  ): Promise<AxiosResponse | void> {
    const response = await axios({
      method,
      url: `${appConfig.sentry.url}/api/0${path}`,
      headers: { Authorization: `Bearer ${this.token}` },
      data,
    }).catch(e => {
      // TODO(you): Catch these sorta errors in Sentry!
      console.error('A request to the Sentry API failed:', {
        status: e.response.status,
        statusText: e.response.statusText,
        data: e.response.data,
      });
    });
    return response;
  }

  public get(path: string): Promise<AxiosResponse | void> {
    return this.request('GET', path);
  }
}
