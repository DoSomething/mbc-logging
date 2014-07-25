var express = require('express');
var path = require('path');
var logger = require('morgan');
var amqp = require('amqp');
var PHPUnserialize = require('php-unserialize');

// Database
var db = require('monk')('localhost:27017/drupal-logging');


// Routes
var routes = require('./routes/index');

var app = express();

app.use(logger('dev'));

// RabbitMQ
var mb_config = require(__dirname + '/config/mb_config.json');
var conn = amqp.createConnection({
  host: mb_config.host,
  port: mb_config.port,
  login: mb_config.login,
  password: mb_config.password,
  connectionTimeout: mb_config.connectionTimeout,
  authMechanism: mb_config.authMechanism,
  vhost: mb_config.vhost,
  noDelay: mb_config.noDelay,
  ssl: { enabled : mb_config.ssl_enabled }
},
{
  defaultExchangeName: mb_config.defaultExchangeName
});
 conn.on('ready', function(){
  var q = conn.queue('loggingQueue', {
    passive: mb_config.passive,
    durable: mb_config.durable,
    exclusive: mb_config.exclusive,
    autoDelete: mb_config.autoDelete
  }, function (q) {
    q.bind('#');
    q.subscribe(function (message) {
      var messageObj = PHPUnserialize.unserialize(message.data);
      var logs = db.get('logs');
      logs.insert({
        "activity" : messageObj.activity,
        "uid" : messageObj.uid,
        "email": messageObj.email,
        "fname" : messageObj.merge_vars.FNAME,
        "activity_timestamp" : messageObj.activity_timestamp,
        "nid" : messageObj.eventID,
      });
    });
  });
});



/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
