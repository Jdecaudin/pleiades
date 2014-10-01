var fs    = require('fs'),
    utils = require('../utils.js');

var importableObjects = {
  run: function(app) {
    this.app     = app;
    var settings = app.pleiades.settings.plugins.importableObjects;

    if(utils.isset(settings, 'path')
    && typeof(settings.path) == "string") {
      app.post(settings.path, function(req, res) {
        if(typeof(req.body) != 'undefined') {
          var data     = req.body;
          var name     = data.name;
          var content  = "module.exports = ";
              content += JSON.stringify(data);
              content +=";";

          fs.writeFile(settings.objectsFolder + "/" + name + '.js', content, function(err) {
            if(err) {
                console.log(err);
            } else {
                console.log("The file was saved!");
            }
          });
        }
      });
    }
    else {
      console.log('Error : No import objects path defined.');
    }
  }

};

module.exports = importableObjects;
