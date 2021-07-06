FROM node:latest

WORKDIR /app

COPY ./package.json ./yarn.lock ./tsconfig.json src/ ./

RUN npm install
RUN npm run build

CMD [ "node", "dist/main.js" ]