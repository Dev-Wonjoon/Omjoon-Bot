FROM node:23

WORKDIR /app

RUN apt-get update && apt-get install -y ffmpeg

COPY package*.json ./
COPY tsconfig.json ./

RUN npm install

COPY . .

RUN npm run build

CMD ["node", "dist/index.js"]