FROM node:20-alpine

RUN apk add --no-cache tini

COPY ./build /dist
COPY ./package.json /dist/package.json
COPY ./node_modules /dist/node_modules

EXPOSE 3000

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "/dist"]
