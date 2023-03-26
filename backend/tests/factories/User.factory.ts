import { Attributes } from 'sequelize';

import User from '../../src/models/User.model';

export default async function createUser(
  fields: Partial<Attributes<User>> = {}
): Promise<User> {
  return User.create({
    name: 'Name',
    avatar: 'https://example.com/avatar',
    ...fields,
  });
}
export { User };
