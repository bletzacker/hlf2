FROM node:12.6

LABEL maintainer "Sudeep Sagar <sudeepjc@gmail.com>"

RUN apt-get update && apt-get install python

WORKDIR /hdfcapp

# RUN npm init --y

COPY ./package.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["node","index.js"]