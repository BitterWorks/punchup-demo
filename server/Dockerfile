FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./
COPY package-lock.json ./

RUN npm ci

RUN npx playwright install
RUN npx playwright install-deps 

COPY . .

EXPOSE 3000

CMD [ "node", "server/api/dist/main.js" ]
