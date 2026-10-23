FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# VITE_*-Variablen (Collection, Feldnamen) werden beim Build eingebacken
RUN npm run build

FROM nginx:1.27-alpine
# Das offizielle nginx-Image rendert /etc/nginx/templates/*.template per envsubst
ENV NGINX_ENVSUBST_FILTER=^DIRECTUS_
COPY deploy/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
