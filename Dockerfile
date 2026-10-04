FROM node:20-alpine

RUN npm install -g @angular/cli@18

WORKDIR /app

COPY package*.json ./

RUN npm install

EXPOSE 4200

CMD ["ng", "serve", "--host", "0.0.0.0", "--poll=500"]
