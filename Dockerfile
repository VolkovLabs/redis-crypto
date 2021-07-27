FROM node:latest

WORKDIR /app

COPY ./package.json ./yarn.lock ./tsconfig.json src/ ./

RUN yarn install
RUN yarn run build

CMD [ "node", "dist/coinbase.js" ]