# ── Build the client and install server deps ──────────────────────────
FROM node:20-alpine AS build
WORKDIR /app

COPY client/package*.json ./client/
RUN npm install --prefix client --no-audit --no-fund
COPY server/package*.json ./server/
RUN npm install --prefix server --omit=dev --no-audit --no-fund

COPY client/ ./client/
RUN npm run build --prefix client
COPY server/ ./server/

# ── Runtime ───────────────────────────────────────────────────────────
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/server ./server
COPY --from=build /app/client/dist ./client/dist
EXPOSE 5180
WORKDIR /app/server
CMD ["node", "index.js"]
