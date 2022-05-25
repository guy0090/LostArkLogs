# https://v2.vuejs.org/v2/cookbook/dockerize-vuejs-app.html#Real-World-Example
FROM node:lts-alpine as common-build-stage

COPY . ./app

WORKDIR /app

RUN npm install
RUN npm run build

FROM common-build-stage as development-build-stage

ENV NODE_ENV development

CMD ["npm", "run", "serve"]

FROM nginx:stable-alpine as production-build-stage

COPY --from=common-build-stage /app/dist /usr/share/nginx/html
EXPOSE 80

ENV NODE_ENV production

CMD ["nginx", "-g", "daemon off;"]
