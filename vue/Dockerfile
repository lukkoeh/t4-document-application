FROM node:18-alpine
# install vue cli
RUN npm install -g @vue/cli
# copy vue app
COPY . /app
WORKDIR /app
# install dependencies
RUN npm install
# start server
EXPOSE 8080
CMD ["npm", "run", "serve"]