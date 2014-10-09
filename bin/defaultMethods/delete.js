var ormHelper = require('../ormHelper.js');

module.exports = function (req, res, service, method, callback) {
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

    callback(req, res, service, method, []);
  });
}
