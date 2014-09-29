var request      = require("request"),
    request_json = require("request-json");

var eventEmitter  = require('events').EventEmitter;
    pubsub        = new eventEmitter();

pubsub.init = function(app) {
  this.app   = app;
  app.pubsub = this;

  var self = this;

  // Consumer
  self.connect(function(ch, q, ok) {
    self.setConsumer(ch, q);
  });

  // Publisher
  self.connect(function(ch, q, ok) {
    self.setPublisher(ch, q, ok);
  })
}

pubsub.connect = function(callback) {
  var open = require('amqplib').connect(this.app.config.rmq.connect);
  var self = this;

  open.then(function(conn) {
    var ok = conn.createChannel();

    ok = ok.then(function(ch) {
      var q = self.app.config.rmq.queue;
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

  ch.assertExchange(self.app.config.rmq.exchange, 'topic', {durable: true});
  ok.then(function() {
    console.log("PubSub publisher ready.");

    // Add new method to publish messages
    self.publish = function(channel, message) {
      ch.publish('global', channel, new Buffer(JSON.stringify(message)));
    };

    // Add event listener to publish messages
    self.on('publish', function(channel, message) {
      ch.publish(self.app.config.rmq.exchange, channel, new Buffer(JSON.stringify(message)));
    });
  });
};

module.exports = pubsub;
