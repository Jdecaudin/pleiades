var async     = require('async');
var ormHelper = require('../ormHelper.js');
var utils     = require('../utils.js');

module.exports = function (req, res, service, method, callback) {
  var message = 'Access ' + req.url;
  console.log(message.prompt);

  // Is a list of objects ?
  var list       = true;
  var object     = service.app.pleiades.objectsByName[method.objectName];
  var objectKey  = ormHelper.getObjectKey(object);
  var halEnabled = false;
  // var hal        = halson();

  // @TODO : remove headers options .... create URL Get parameters
  var parameters = ormHelper.getParametersFromHeaders(req);

  if(utils.isset(service.app.pleiades.plugins,'halify')
  && utils.isset(object,'hal.fieldBinding.id')) {
    halify = service.app.pleiades.plugins.halify;
    // @TODO return results if halEnabled == false ??
    halEnabled = true;
  }

  if(typeof(req.param('id')) != 'undefined') {
    // Search object by Id, so override header's ID field
    parameters.fields[objectKey] = req.param(objectKey);
  }

  if(typeof(parameters.fields[objectKey]) != 'undefined') {
    var list = false;
  }

  req.models[method.objectName].find(
    parameters.fields,
    parameters.options,
    function(err, results) {
      if(err) {
        res.status(500);
        res.send(err);
      }
      else {
        // With the current ORM, blob are returned as Buffers, so we need to
        // decode them
        ormHelper.decodeBlob(results, function() {
          if(results.length > 0) {
            res.send(results);
            callback(req, res, service, method, results);
          }
          else {
            res.status(404);
            res.end();
            callback(req, res, service, method, results);
          }
        });
      }
    }
  );
};
