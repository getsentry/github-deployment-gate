import { Strategy as GitHubStrategy } from 'passport-github';
import { InferAttributes } from 'sequelize';

import { appConfig } from '../../config';
import User from '../../models/User.model';

export const gitHubStrategy = new GitHubStrategy(
  {
    clientID: appConfig.githubOAuthApp.clientID,
    clientSecret: appConfig.githubOAuthApp.clientSecret,
  },
  async (_accessToken, _refreshToken, profile, cb) => {
    try {
      let user = await User.findOne({
        where: {
          githubHandle: profile.username,
        },
      }).then(user => user?.get() as InferAttributes<User>);

      // if user does not already exist, create a new user
      if (!user) {
        user = await User.create({
          name: profile.displayName,
          githubHandle: profile.username,
          refreshToken: null,
          avatar: profile.photos[0]?.value ?? '',
        });
      }
      cb(null, user); // TODO: verify if this is the right way to do this
    } catch (ex) {
      console.error(ex);
      cb(ex, null);
    }
  }
);
