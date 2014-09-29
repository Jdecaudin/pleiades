var ormHelper = require('../ormHelper.js');

get = {
  autoLoad : function (service, method) {
    service.app.get('/' + method.objectName, function (req, res) {
      var callback = (method.hasOwnProperty('callback')) ? method.callback : false;

      if(method.hasOwnProperty('preprocess')) {
        method.preprocess(service, method, req, res, function() {
          get.process(service, method, req, res, callback);
        });
      }
      else {
        get.process(service, method, req, res, callback);
      }
    });
  },

  process : function (service, method, req, res, callback) {
    console.log('Access /' +  method.objectName);

    var parameters = ormHelper.getParametersFromHeaders(req);

    req.models[method.objectName].find(
      parameters['fields'],
      parameters['options'],
      function(err, results) {
        if(err) {
          res.status(500);
          res.send(err);
        }
        else {
          if(callback) {
            callback(results, service, method, req, res);
          }
          else {
            res.send(results);
          }
        }
      }
    );
  }
}

module.exports = get.autoLoad;
