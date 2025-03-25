FROM node:23.4.0-bookworm-slim AS build
RUN apt-get update -y && apt-get install -y openssl
WORKDIR /usr/src/app
COPY package*.json ./
COPY tsconfig.json ./
COPY types.d.ts ./
COPY ./server ./server
COPY ./client ./client
COPY ./prisma ./prisma
RUN npm ci
RUN npx prisma generate
RUN npx tsc
WORKDIR /usr/src/app/client
RUN npm ci
RUN npm run build

FROM node:23.4.0-bookworm-slim
RUN apt-get update -y && apt-get install -y openssl
WORKDIR /usr/src/app
COPY package*.json ./
COPY ./prisma ./prisma
RUN npm i @prisma/client
RUN npx prisma generate
COPY --from=build /usr/src/app/serverbuild ./serverbuild
COPY --from=build /usr/src/app/client/dist ./client/dist
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=192"
RUN npm i --omit-dev
EXPOSE 3000
CMD ["node", "serverbuild/app.js"]
