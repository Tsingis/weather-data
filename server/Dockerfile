FROM node:24-alpine AS build

WORKDIR /app

COPY package.json ./
COPY yarn.lock ./

RUN yarn install --frozen-lockfile

COPY /src ./
COPY tsconfig.json ./

RUN yarn build

FROM node:24-alpine

WORKDIR /app

COPY package*.json ./
RUN yarn install --omit=dev --frozen-lockfile

COPY --from=build /app/dist ./dist

RUN addgroup -S app && \
    adduser -S -G app api

USER api

CMD ["node", "dist/index.js"]