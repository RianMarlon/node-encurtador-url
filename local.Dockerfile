FROM node:22.15.0-alpine

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /usr/src/app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm prisma generate

CMD ["sh", "-c", "pnpm run migration:run && pnpm run dev"]
