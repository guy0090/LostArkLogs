# Lost Ark Logs  
This project aims to allow users to self-host DPS logs produced by a custom branch of [LOA Details](https://github.com/guy0090/loa-details) (shoutout to [karaeren](https://github.com/karaeren/loa-details) for the original).  

Packet data is obtained from a customized [LostArkLogger](https://github.com/guy0090/LostArkLogger) (again shoutout to [shalzuth](https://github.com/shalzuth/LostArkLogger) for the original).  

Live version is available [here](https://dps.arsha.io)  

*Simple version for now, will add in-depth guide soon*  

## Production  
The project is easiest to get running by using [Docker](https://docker.com).  

User authentication is provided by Discord via OAuth2. You need to create a application [here](https://discord.com/developers/applications) and copy/paste your `Client ID`, `Client Secret` and `Redirect URI` in the steps below.  

Check [Discord Docs](https://discord.com/developers/docs/topics/oauth2) for more infomration.  

### Production Setup Configuration  

* **Configure backend**: `./backend/.env.example`
  * Rename env file to `.env.production.local`
* **Configure frontend**: `./frontend/.env.example`
  * Rename env file to `.env`
* **Configure docker**: `./docker-compose.yml`
  * If using SSL (recommended), configure `volumes` for `api` service in `./docker-compose.yml` to point to your certificates
  * Check out [certbot](https://certbot.eff.org/) if you plan to use SSL but don't have a certificate.
  
To start the container run `docker-compose -p SERVICE_NAME up -d`.  
This will expose 3 services (presuming you didn't modify the names): `site` (port 9797), `api` (port 9898) and `mongo` (port 27016).  
It is assumed you will be proxying them with [nginx](https://nginx.com) or similar.
An example configuration for nginx using [certbot](https://certbot.eff.org/) to configure SSL can be found in `./nginx`  
Additionally, the `api` service is currently only tested while running on a sub-domain of the `site` service i.e.: https://api.example.com. Running on a subpath like `/api` is not tested and will most likely not work out of the box.  

*User management is currently not implemented (25.05.2022).*  

You currently have to manually edit user permissions in MongoDB to allow uploading sessions. [Compass](https://www.mongodb.com/products/compass) is an easy to use tool for this. There is a built-in role called `verified` which contains all necessary permissions.  

## Development  
If you'd like to contribute to the project, a local development version can be used.  
Configuration steps are mostly the same as in [Production](#production).  

### Development Setup Configuration  
* **Configure backend**: `./backend/.env.example`
  * Rename env file to `.env.development.local`
  * Run `npm install`
* **Configure frontend**: `./frontend/.env.example`
  * Rename env file to `.env`
  * Run `npm install`
* **Configure docker**: `./docker-compose.dev.yml`

To start the container run `docker-compose -f ./docker-compose.dev.yml -p SERVICE_NAME up -d`.  

I haven't found a clear solution to hot-reloading content from `./frontend` while running in docker, so if you would rather run it standalone to allow hot-reloading this is also possible with the following config:

### Hot Reloading  
Follow the steps in [Setup Configuration](#development-setup-configuration) above.  
When running the container, instead of using `./docker-compose.dev.yml`, run `./backend/docker-compose.yml`.  
This will start the `api` service as it's own container.  

The frontend component of LAL was tested using [NodeJS LTS](https://nodejs.org/en/). Node >= 18 works as well.  

Steps to run `site` with hot-reloading use the following commands:  
* `cd ./frontend`
  * If modules are not already installed: `npm i -q`
* `npm run serve`