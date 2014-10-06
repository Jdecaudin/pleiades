var utils     = require('../utils.js'),
    ormHelper = require('../ormHelper.js')
    _         = require('underscore');

var exposeObjects = {
  run: function(app, callback) {
    this.app     = app;
    var settings = app.pleiades.settings.plugins.exposeObjects;

    if(utils.isset(settings, 'path')
    && typeof(settings.path) == "string") {
      app.get(settings.path, function(req, res) {
        // if(utils.isset(req, 'headers.'))
        var params  = ormHelper.getParametersFromHeaders(req);
        if(utils.isset(params, 'fields.name')) {
          if(utils.isset(app.pleiades.objects, params.fields.name)) {
            var returns = app.pleiades.objects[params.fields.name];
          }
          else {
            res.status(404);
            res.end();
          }
        }
        else {
          var returns = app.pleiades.objects;
        }

        if(typeof(returns) != 'undefined') {
          res.send(returns);
        }
      });

      callback();
    }
    else {
      console.log('Error : No exposed objects path defined.');
      callback();
    }
  }
};

module.exports = exposeObjects;
