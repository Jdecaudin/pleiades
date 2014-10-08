var ormHelper = require('../ormHelper.js');

put = {
  autoLoad : function (service, method) {
    service.app.put('/' + method.objectName, function (req, res) {
      if(method.hasOwnProperty('preprocess')) {
        method.preprocess(service, method, req, res, function() {
          put.process(service, method, req, res);
        });
      }
      else {
        put.process(service, method, req, res);
      }
    });
  },

  process : function (service, method, req, res) {
    var message = 'Update /' +  method.objectName;
    console.log(message.prompt);

    var parameters = ormHelper.getParametersFromHeaders(req);

    req.models[method.objectName].find(
      parameters['fields'],
      parameters['options'],
      function(err, results) {
      if(err) {
        // res.status(204); ???
        res.status(500);
        res.send(err);
      }
      else {
        for(var field in req.body) {
           if (req.body.hasOwnProperty(field)) {
             results[0][field] = req.body[field];
           }
        }

        results[0].save(function (err) {
          if(err) {
            // res.status(204); ???
            res.status(500);
            res.send(err);
          }
          else {
            res.send(results);
          }
        });
      }
    });
  }
}

module.exports = put.autoLoad;
