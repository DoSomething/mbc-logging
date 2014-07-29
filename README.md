# Logging
This is a very simple node app that takes events from RabbitMQ and logs them into  a mongo database.

# Prerequisites
1. [MongoDB](http://docs.mongodb.org/manual/installation/)
2. [Node](http://nodejs.org/download/)

# Local Installation  
1. Clone the repo
2. run `cd mbc-logging && npm install`
3. Add a `mb_config.json` file that contains RabbitMQ connection settings.
4. Start the app`DEBUG=mbc-logging ./bin/www`
