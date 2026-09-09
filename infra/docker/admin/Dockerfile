# Stage 1 — build
FROM node:24-alpine AS builder
WORKDIR /app

ARG VITE_API_BASE_URL
ARG ADMIN_BASE_PATH=/admin
ARG CONTAINER_ADMIN_PORT=3001
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL \
    ADMIN_BASE_PATH=$ADMIN_BASE_PATH \
    ADMIN_PORT=$CONTAINER_ADMIN_PORT

COPY frontend-admin/package.json frontend-admin/package-lock.json ./
RUN npm ci

COPY frontend-admin/ .
RUN npm run build

# Stage 2 — serve with nginx
FROM nginx:1.27-alpine AS runner

ARG CONTAINER_ADMIN_PORT=3001

COPY --from=builder /app/dist /usr/share/nginx/html
COPY infra/docker/admin/nginx.conf /tmp/default.conf
RUN sed "s/__CONTAINER_ADMIN_PORT__/${CONTAINER_ADMIN_PORT}/g" /tmp/default.conf \
      > /etc/nginx/conf.d/default.conf

EXPOSE 3001

CMD ["nginx", "-g", "daemon off;"]
