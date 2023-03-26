import { createHmac } from 'crypto';
import { NextFunction, Request, Response } from 'express';

import { appConfig } from '../config';

export function verifyGithubSignature(
  request: Request,
  response: Response,
  next: NextFunction
) {
  /**
   * This function will authenticate that the requests are coming from Github.
   * It allows us to be confident that all the code run after this middleware are
   * using verified data sent directly from Githube.
   */
  if (appConfig.isTestMode) {
    return next();
  }
  const signature = request.header('X-Hub-Signature-256');
  const hash = createHmac('sha256', appConfig.githubGateApp.webhookSecret)
    .update((<any>request).rawBody)
    .digest('hex');
  const expectedSignature = `sha256=${hash}`;

  if (signature !== expectedSignature) {
    console.log('Invalid signtaure');
    return response.status(401).send('Invalid signature');
  }
  next();
}
