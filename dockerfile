FROM node:latest

WORKDIR /app

RUN apt-get update && apt-get install -y ffmpeg

COPY package*.json ./

RUN npm install

COPY . .

CMD ["node", "index.js"]
