var _                = require('underscore'),
    async            = require('async'),
    defaultMethods   = {
      //@TODO auto load methods
      POST:   require('./defaultMethods/post.js'),
      GET:    require('./defaultMethods/get.js'),
      PUT:    require('./defaultMethods/put.js'),
      DELETE: require('./defaultMethods/delete.js'),
    };

var services = {
  app     : {},
  objects : {},

  /**
   * Constructor for services object
   * @param  {object}   express     express instance
   * @param  {object}   app         server instance
   * @param  {object}   objects     list of service to implement, with callbacks
   * @param  {Function} callback    action to perform after configuration
   */
  configure : function(app, objects, callback) {
    this.app     = app;
    this.objects = objects;

    // ajoute le nom de l'objet dans les méthode qui le compose (utile pour la suite)
    _.each(this.objects, function(object, objectIndex, objectList) {
      _.each(object.methods, function(method, methodIndex, methodList) {
        this.objects[objectIndex].methods[methodIndex].objectName = this.objects[objectIndex].name;
      });
    });

    // Express Middleware, set headers
    this.app.use(function(req, res, next) {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
      // TODO : dynammicaly add methods
      res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");

      next();
    });

    // Add "options" to allow PUT and some other actions
    this.app.options('*', function(req, res) {
      res.end();
    });

    callback(app);
  },

  // run all objects
  run : function (callback) {
    async.eachSeries(this.objects, this.addService, function(err) {
      if(err != undefined) {
        console.log('Error, can\'t run webservices'.error, err);
      }
      else {
        callback();
      }
    });
  },

  // Run all methods of a specific object
  addService : function(object, callback) {
    var _self = services;

    async.eachSeries(object.methods, _self.runMethod, function(err) {
      if(err != undefined) {
        var message = 'Une erreur est survenue lors du lancement du service ' + object.name;
        console.log(message.error, err);
      }
      else {
        var message = 'Service ' + object.name + ' run successfully';
        console.log(message.success);
        callback();
      }
    });
  },

  // Run specific methode
  runMethod : function(method, callback) {
    var _self = services;

    // Call default method
    if(!_.has(method, 'process') && _.has(defaultMethods, method.name)) {
      defaultMethods[method.name](_self, method);
    }
    // Call overrided method
    else if(_.has(method, 'process')) {
      method.process(_self);
    }
    // No method found
    else {
      var message = 'Error : ' + method.objectName + ' have a methode named ' + method.name + ' but no function to run it.';
      console.log(message.error);
    }

    callback();
  },

}

module.exports = services;
