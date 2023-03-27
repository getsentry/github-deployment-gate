import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';
import { InferAttributes } from 'sequelize';

import { appConfig } from '../../config';
import User from '../../models/User.model';

export const jwtStrategy = new JwtStrategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: appConfig.accessTokenSecret,
  },
  (payload, done) => {
    User.findOne({
      where: {
        id: payload.data.id,
      },
    })
      .then(user => user?.get() as InferAttributes<User>)
      .then(user => {
        const { refreshToken, ...rest } = user;
        return rest;
      })
      .then(user => {
        if (user) {
          return done(null, user);
        }
        return done(new Error('user not found'), null);
      })
      .catch(err => {
        return done(err, null);
      });
  }
);
