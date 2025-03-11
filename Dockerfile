# 1. Build our Node app
FROM node:18.20.7-alpine AS builder

WORKDIR /app
COPY package.json package-lock.json ./

RUN npm install --omit=dev
RUN npm install --save-dev webpack-cli

COPY . ./

EXPOSE 3000
CMD ["node", "app.js"]
