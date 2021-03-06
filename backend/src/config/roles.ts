export const roles = [
  {
    _id: 0,
    name: 'user',
    default: true,
    builtIn: true,
    inherits: [],
    permissions: ['user.self'],
  },
  {
    _id: 1,
    name: 'verified',
    default: false,
    builtIn: true,
    inherits: [0],
    permissions: ['log.recents', 'log.upload', 'log.delete', 'verified'],
  },
  {
    _id: 2,
    name: 'admin',
    default: false,
    builtIn: true,
    inherits: [1],
    permissions: [
      'admin',
      'logs.unlisted',
      'users.manage',
      'users.manage.moderate',
      'users.manage.permissions',
      'users.manage.roles',
      'logs.manage',
      'service.manage.cache',
    ],
  },
  {
    _id: 3,
    name: 'superadmin',
    default: false,
    builtIn: true,
    inherits: [2],
    permissions: ['*'],
  },
];
