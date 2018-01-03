FROM node:9.2.0-slim

RUN npm install pm2 -g

RUN mkdir -p /app
WORKDIR /app

ADD package.json /app
RUN npm install --production

ADD . /app

CMD ["pm2-docker", "process.json", "--env", "production", "--update-env", "--watch"]
