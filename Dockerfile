FROM node:22.15.0-alpine AS build

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /usr/src/app

COPY pnpm-lock.yaml .
COPY package.json .

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm prisma generate
RUN pnpm run build

FROM node:22.15.0-alpine

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /usr/src/app

COPY pnpm-lock.yaml .
COPY package.json .

RUN pnpm install --frozen-lockfile --prod --ignore-scripts

COPY --from=build /usr/src/app/dist ./dist

CMD ["pnpm", "run", "start"]
