var bodyParser       = require('body-parser'),
    expressValidator = require('express-validator'),
    async            = require('async'),
    orm              = require('orm'),
    ormHelper        = require('./bin/ormHelper.js'),
    fs               = require('fs'),
    services         = require('./bin/services.js')
    objects          = [],
    objectsHelper    = require('./bin/objectsHelper.js');

module.exports = function(app, settings, callbackPleiades) {
  app.use(bodyParser.json());
  app.use(expressValidator());

  // Check settings
  if(typeof(settings.objectsFolder) != 'undefined') {
    // Get objects
    objectsHelper.getObjects(settings.objectsFolder, objects, function() {
      app.pleiades = {
        objects: objects,
      };
      // Use ORM to run services
      app.use(orm.express(settings.orm, {
        define: function (db, models, next) {
          // Init models for each objects
          ormHelper.define(app, db, models, next);
        }
      }));

      // Prepare objects
      services.configure(app, objects, function(app) {
        // run services
        services.run(function() {
          // require('./bin/pubsub.js').init(app);

          // Set exposed objects router
          if(settings.hasOwnProperty('exposeObjects')
          && settings.exposeObjects.hasOwnProperty('active')
          && settings.exposeObjects.active === true) {
            if(settings.exposeObjects.hasOwnProperty('path')
            && typeof(settings.exposeObjects.path) == "string") {
              app.get(settings.exposeObjects.path, function(req, res) {
                res.send(app.pleiades.objects);
              });
            }
            else {
              console.log('Error : No exposed objects path defined.');
            }
          }

            // Set importable objects router
            if(settings.hasOwnProperty('importableObjects')
            && settings.importableObjects.hasOwnProperty('active')
            && settings.importableObjects.active === true) {
              if(settings.importableObjects.hasOwnProperty('path')
              && typeof(settings.importableObjects.path) == "string") {
                app.post(settings.importableObjects.path, function(req, res) {
                  if(typeof(req.body) != 'undefined') {
                    var data    = req.body;
                    var name    = data.name;
                    var content = "module.exports = ";
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
                console.log('Error : No exposed objects path defined.');
              }
            }

          callbackPleiades();
        });
      });
    });
  }
  else {
    console.log('Error : No objects folder defined.');
  }
}
