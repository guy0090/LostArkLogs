import SocketEvent from '@/objects/socketEvent.object';

export const socketEvents = [
  // Auth related
  new SocketEvent('login', true, []),
  new SocketEvent('tokens', true, []),

  // Access
  new SocketEvent('page_access', true, []),
  new SocketEvent('has_permissions', true, []),

  // User (all)
  new SocketEvent('get_user', false, []),
  new SocketEvent('get_users', true, ['users.manage']),
  new SocketEvent('get_user_permissions', true, ['users.manage.permissions']),

  // User (self)
  new SocketEvent('get_self', true, ['user.self']),
  new SocketEvent('get_permissions', true, []),

  // Logs
  new SocketEvent('get_log', false, []),
  new SocketEvent('upload_log', true, ['log.upload']),
  new SocketEvent('unique_bosses', false, []),
  new SocketEvent('supported_bosses', false, []),
  new SocketEvent('filter_logs', true, ['ws.logs.filter']),

  // Misc
  new SocketEvent('connect', false, []),
  new SocketEvent('send_command', true, []),
];
