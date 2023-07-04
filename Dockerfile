FROM node:20-alpine as build
WORKDIR /usr/src/app
COPY package*.json ./
COPY tsconfig.json ./
COPY types.d.ts ./
COPY ./server ./server
COPY ./client ./client
RUN npm ci
RUN npx tsc
WORKDIR /usr/src/app/client
RUN npm ci
RUN npm run build

FROM node:20-alpine
WORKDIR /usr/src/app
COPY package*.json ./
COPY --from=build /usr/src/app/serverbuild ./serverbuild
COPY --from=build /usr/src/app/client/dist ./client/dist
ENV NODE_ENV production
ENV NODE_OPTIONS = "--max-old-space-size=192"
RUN npm i --omit-dev
EXPOSE 3000
CMD ["node", "serverbuild/index.js"]
