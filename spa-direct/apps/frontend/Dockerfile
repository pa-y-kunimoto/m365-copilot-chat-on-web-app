FROM node:24-slim AS build

WORKDIR /app

COPY package.json ./
RUN npm install

COPY index.html vite.config.js ./
COPY src/ ./src/

ARG VITE_AZURE_CLIENT_ID
ARG VITE_AZURE_TENANT_ID
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
