import { cleanEnv, port, str, url } from 'envalid';

const validateEnv = () => {
  cleanEnv(process.env, {
    NODE_ENV: str(),
    PORT: port(),
    CLIENT_DOMAIN: str(),
    SERVER_DOMAIN: str(),
    DB_HOST: str(),
    DB_PORT: port(),
    DB_DATABASE: str(),
    CLIENT_ID: str(),
    CLIENT_SECRET: str(),
    REDIRECT_URI: url(),
    SECRET_KEY: str(),
    LOG_FORMAT: str(),
    LOG_DIR: str(),
    ORIGIN: url(),
    SSL_KEY: str(),
    SSL_CERT: str(),
  });
};

export default validateEnv;
