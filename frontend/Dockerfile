FROM node:23.1.0-slim

WORKDIR /app

COPY . /app

RUN npm i

EXPOSE 3001

RUN npm run build

CMD ["npm", "run", "serve"]