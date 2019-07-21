FROM node:12.6.0

RUN mkdir /usr/src/app
RUN apt-get update; apt-get install -y nano;

WORKDIR /usr/src/app
COPY . .
RUN npm install

CMD ["node", "./src/index.js"]
