FROM node:24-alpine AS build

WORKDIR /app

ENV NO_UPDATE_NOTIFIER=true

FROM nginxinc/nginx-unprivileged:1.27-alpine-slim

CMD ["nginx", "-g", "daemon off;"]