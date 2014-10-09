var ormHelper = require('../ormHelper.js');

module.exports = function (req, res, service, method, callback) {
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

      callback(req, res, service, method, results);
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

        callback(req, res, service, method, results);
      });
    }
  });
}
