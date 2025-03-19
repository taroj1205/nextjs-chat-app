FROM node:20-alpine as base
RUN apk add --no-cache g++ make py3-pip libc6-compat
WORKDIR /app
COPY package*.json ./
COPY pnpm-lock.yaml ./
EXPOSE 3000

RUN npm install -g pnpm

RUN pnpm install --frozen-lockfile

FROM base as builder
WORKDIR /app
COPY . .
RUN pnpm run build


FROM base as production
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs


COPY --from=builder --chown=nextjs:nodejs /app /app

CMD pnpm start

FROM base as dev
ENV NODE_ENV=development
COPY . .
CMD pnpm run dev

