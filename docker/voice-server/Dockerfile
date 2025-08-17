FROM node:20-bullseye-slim

WORKDIR /app

COPY package.json package-lock.json* ./
# No heavy install required for the simple server; it uses built-in fetch where available
# but keep package install in case repo uses other dependencies
RUN npm ci --only=production || true

COPY scripts/voice-server.mjs ./voice-server.mjs

EXPOSE 49231

CMD ["node", "./voice-server.mjs"]
