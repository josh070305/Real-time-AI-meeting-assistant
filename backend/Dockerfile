FROM node:22-alpine

WORKDIR /app

# Copy package files first for layer caching
COPY package*.json ./

# Install production deps only
RUN npm ci --omit=dev

# Copy all source files
COPY . .

# Run as the built-in non-root node user (uid 1000)
USER node

# Render sets PORT dynamically; default to 4000 for local docker runs
ENV PORT=4000
ENV NODE_ENV=production

EXPOSE 4000

CMD ["node", "server.js"]
