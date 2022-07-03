import 'reflect-metadata';
import App from '@/app';
import AuthRoute from '@routes/auth.route';
import IndexRoute from '@routes/index.route';
import UsersRoute from '@routes/users.route';
import validateEnv from '@utils/validateEnv';
import LogsRoute from '@/routes/logs.route';
import AdminRoute from './routes/admin.route';

validateEnv();

const app = new App([new IndexRoute(), new UsersRoute(), new AuthRoute(), new LogsRoute(), new AdminRoute()]);

app.listen();
