# 1. Build our Node app
FROM node:18.20.7-alpine AS builder

WORKDIR /app
COPY package.json package-lock.json ./

RUN npm install
COPY . ./
RUN npm run build

# 2. Deploy our Node app to NGINX
FROM nginx:alpine

## Replace the default nginx index page with our node app
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 80
ENTRYPOINT ["nginx", "-g", "daemon off;"]