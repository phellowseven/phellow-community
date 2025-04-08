FROM node:20-alpine

WORKDIR /app

COPY ./server.mjs server.mjs
COPY ./package.json package.json

RUN npm install

EXPOSE 8080

CMD ["node", "server.mjs"]