var ormHelper = require('../ormHelper.js');

module.exports = function (req, res, service, method, callback) {
  var message = 'Access /' +  method.objectName;
  console.log(message.prompt);

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
        res.send(results);
      }

      callback(req, res, service, method, results);
    }
  );
};
