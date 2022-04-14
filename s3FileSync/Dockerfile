FROM node:14
RUN apt-get update -y
RUN apt-get install inotify-tools vim -y
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
RUN mkdir data data/Send data/Receive data/ProcessedSend data/ProcessedReceive data/Inbox data/Outbox

# Bundle app source
COPY . .
CMD [ "node", "index.js" ]
