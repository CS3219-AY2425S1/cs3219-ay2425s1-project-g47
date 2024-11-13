# offcial node image as parent image
FROM node:20-alpine
# set working directory to user-servce, all subsequent commands will run in this dire
WORKDIR /app
# copy all package json files to current-directory
COPY package*.json ./
# install dependencies
RUN npm install
# copy all the files in the current dir 
COPY . .
# user-service uses port 3001
EXPOSE 3001
# start service with npm run start
CMD ["npm", "start"]
