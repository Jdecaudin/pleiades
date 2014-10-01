post = {
  autoLoad : function (service, method) {
    service.app.post('/' + method.objectName, function (req, res) {
      if(method.hasOwnProperty('preprocess')) {
        method.preprocess(service, method, req, res, function() {
          post.process(service, method, req, res);
        });
      }
      else {
        post.process(service, method, req, res);
      }
    });
  },

  process : function (service, method, req, res) {
    if(typeof(req.body) != 'undefined') {
      var data = req.body;
      console.log('Create /' + method.objectName);

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
      });
    }
    else {
      res.status(500);
      res.send("No body found on the request ");
    }
  }
}

module.exports = post.autoLoad;
