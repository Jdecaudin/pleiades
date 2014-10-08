var ormHelper = require('../ormHelper.js');

Delete = {
  autoLoad : function (service, method) {
    service.app.delete('/' + method.objectName, function (req, res) {
      if(method.hasOwnProperty('preprocess')) {
        method.preprocess(service, method, req, res, function() {
          Delete.process(service, method, req, res);
        });
      }
      else {
        Delete.process(service, method, req, res);
      }
    });
  },

  process : function (service, method, req, res) {
    var message = 'Delete /' +  method.objectName;
    console.log(message.prompt);

    var parameters = ormHelper.getParametersFromHeaders(req);

    req.models[method.objectName].find(parameters['fields'], parameters['options']).remove(function(err) {
      if(err) {
        res.status(500);
        res.send(err);
      }
      else {
        res.status(204);
        res.end();
      }
    });
  }
}

module.exports = Delete.autoLoad;
