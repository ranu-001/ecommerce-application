FROM node:22-alpine

ENV NODE_ENV=production
ENV PORT=5000

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --chown=node:node server ./server
COPY --chown=node:node client ./client

USER node

EXPOSE 5000

CMD ["npm", "start"]
