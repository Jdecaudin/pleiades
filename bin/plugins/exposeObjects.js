var utils = require('../utils.js');

var exposeObjects = {
  run: function(app) {
    this.app     = app;
    var settings = app.pleiades.settings.plugins.exposeObjects;

    if(utils.isset(settings, 'path')
    && typeof(settings.path) == "string") {
      app.get(settings.path, function(req, res) {
        res.send(app.pleiades.objects);
      });
    }
    else {
      console.log('Error : No exposed objects path defined.');
    }
  }
};

module.exports = exposeObjects;
