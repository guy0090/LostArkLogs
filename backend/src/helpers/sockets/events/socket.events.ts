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
  new SocketEvent('zones', false, []),
  new SocketEvent('tracked_zones', false, []),
  new SocketEvent('supported_bosses', false, []),
  new SocketEvent('filter_logs', true, ['ws.logs.filter']),
  new SocketEvent('update_log_visibility', true, ['log.upload']),

  // Stats
  new SocketEvent('log_counts', false, []),
  new SocketEvent('class_dist', false, []),
  new SocketEvent('dps_ranking', false, []),

  // Misc
  new SocketEvent('connect', false, []),
  new SocketEvent('send_command', true, []),
];
