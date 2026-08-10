FROM node:20-alpine
WORKDIR /app
COPY package.json .
RUN npm install --production
COPY . .
EXPOSE 5005
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --spider http://localhost:5005/healthz || exit 1
CMD ["node", "server.js"]
