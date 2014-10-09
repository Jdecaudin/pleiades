module.exports = function (req, res, service, method, callback) {
  if(typeof(req.body) != 'undefined') {
    var data = req.body;

    var message = 'Create /' +  method.objectName;
    console.log(message.prompt);

    var channelName = method.objectName + ':post';

    var pluginsHelper = require('../pluginsHelper.js');
    if(pluginsHelper.isEnable('pubsub')) {
      service.app.pubsub.publish(channelName, data);
    }

    req.models[method.objectName].create([data], function(err, results) {
      if(err) {
        res.status(500);
        res.send(err);
      }
      else {
        res.status(201);
        res.send(results);
      }

      callback(req, res, service, method, results);
    });
  }
  else {
    res.status(500);
    res.send("No body found on the request ");

    callback(req, res, service, method, []);
  }
}
