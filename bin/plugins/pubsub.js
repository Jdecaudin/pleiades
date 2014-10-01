var request      = require("request"),
    request_json = require("request-json"),
    utils        = require('../utils.js');

var eventEmitter  = require('events').EventEmitter;
    pubsub        = new eventEmitter();

pubsub.run = function(app) {
  this.settings = app.pleiades.settings.plugins.pubsub.setting;
  this.app      = app;
  app.pubsub    = this;

  var self = this;

  if(this.settings.driver == 'rmq') {
    // Consumer
    self.connect(function(ch, q, ok) {
      self.setConsumer(ch, q);
    });

    // Publisher
    self.connect(function(ch, q, ok) {
      self.setPublisher(ch, q, ok);
    });
  }
}

pubsub.connect = function(callback) {
  var open = require('amqplib').connect(this.settings.connect);
  var self = this;

  open.then(function(conn) {
    var ok = conn.createChannel();

    ok = ok.then(function(ch) {
      var q = self.settings.queue;
      ch.assertQueue(q);

      callback(ch, q, ok);
    });
    return ok;
  }).then(null, console.warn);
};

pubsub.setConsumer = function(ch, q, ok) {
  var self = this;

  console.log("PubSub consumer ready.");

  ch.consume(q, function(msg) {
    if (msg !== null) {
      var newMessage = JSON.parse(msg.content.toString());
      var rk = msg.fields.routingKey;

      self.emit('reception', rk, newMessage);
      ch.ack(msg);
    }
  });
};

pubsub.setPublisher = function(ch, q, ok) {
  var self = this;

  ch.assertExchange(self.settings.exchange, 'topic', {durable: true});
  ok.then(function() {
    console.log("PubSub publisher ready.");

    // Add new method to publish messages
    self.publish = function(channel, message) {
      ch.publish('global', channel, new Buffer(JSON.stringify(message)));
    };

    // Add event listener to publish messages
    self.on('publish', function(channel, message) {
      ch.publish(self.settings.exchange, channel, new Buffer(JSON.stringify(message)));
    });
  });
};

module.exports = pubsub;
