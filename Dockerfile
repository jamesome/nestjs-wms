FROM node:20.12.2-alpine AS base
WORKDIR /srv/app
RUN yarn global add @nestjs/cli

FROM base AS development
ENV NODE_ENV=development
RUN apk update && apk add python3 make
CMD ([ -d ./node_modules ] && echo "node_modules directory exists" || mkdir ./node_modules) && \
    yarn && yarn start:dev

FROM base AS production
ENV NODE_ENV=production
COPY package*.json ./
COPY yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build
CMD [ "yarn", "start:prod" ]