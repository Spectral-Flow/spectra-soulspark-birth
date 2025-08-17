FROM node:18-slim
WORKDIR /app
# copy only what's needed for the voice server
COPY scripts /app/scripts
COPY .assistant_memory /app/.assistant_memory
COPY .spectra_memory /app/.spectra_memory
ENV NODE_ENV=production
EXPOSE 49231
CMD ["node","scripts/voice-server.mjs"]
