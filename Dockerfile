FROM node:10

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

RUN npm install discord.js

COPY . .

EXPOSE 8080

CMD ["node", "."]