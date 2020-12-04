FROM node:14.4.0

ARG PORT
ENV port=$PORT

WORKDIR /usr/src/app

COPY . .

RUN yarn

CMD [ "yarn", "start" ]

EXPOSE ${port}
