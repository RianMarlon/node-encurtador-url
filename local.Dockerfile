FROM node:22.15.0-alpine

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /usr/src/app

COPY . .

RUN pnpm install --frozen-lockfile

CMD ["pnpm", "run", "dev"]
