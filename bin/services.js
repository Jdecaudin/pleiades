var _                = require('underscore'),
    async            = require('async'),
    utils            = require('./utils.js'),
    defaultMethods   = {
      //@TODO auto load methods
      post:   require('./defaultMethods/post.js'),
      get:    require('./defaultMethods/get.js'),
      put:    require('./defaultMethods/put.js'),
      delete: require('./defaultMethods/delete.js'),
    };

var services = {
  app     : {},
  objects : {},

  /**
   * Constructor for services object
   * @param  {object}   app      server instance
   * @param  {object}   objects  list of service to implement, with callbacks
   * @param  {Function} callback action to perform after configuration
   */
  configure : function(app, objects, callback) {
    this.app     = app;
    this.objects = objects;

    // ajoute le nom de l'objet dans les méthode qui le compose (utile pour la suite)
    _.each(this.objects, function(object, objectIndex, objectList) {
      _.each(object.methods, function(method, methodIndex, methodList) {
        this.objects[objectIndex].methods[methodIndex].objectName = this.objects[objectIndex].name;
        this.objects[objectIndex].methods[methodIndex].objectPluralName = this.objects[objectIndex].plural;
      });
    });

    // Express Middleware, set headers
    this.app.use(function(req, res, next) {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, X-Fields, X-Options");
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

  preprocess: function(req, res, method, callback) {
    if(utils.isset(method, 'preprocess')) {
      async.eachSeries(
        method.preprocess,
        function(preprocess, next) {
          if(typeof(preprocess) == 'function') {
            preprocess(req, res, next);
          }
          else {
            var message = method.objectName + " have bad preprocess (not a function).";
            console.log(message.warn);
            next();
          }
        },
        function(err) {
          if(err) {
            console.log('Error : '.error, err);
          }
          else {
            callback();
          }
        }
      );
    }
    else {
      callback();
    }
  },

  process: function(req, res, method, callback) {
    var self = this;

    if(utils.isset(method, 'process')) {
      if(typeof(method.process) == 'function') {
        method.process(req, res, self, method, callback);
      }
      else {
        var message = method.objectName + " have bad process (not a function).";
        console.log(message.warn);
        callback();
      }
    }
    else if(utils.isset(defaultMethods, method.verb)) {
      defaultMethods[method.verb](req, res, self, method, callback);
    }
    else {
      var message = 'Error : ' + method.objectName + ' have a methode named ' + method.verb + ' but no function to run it.';
      console.log(message.error);
    }
  },

  callback: function(req, res, service, method, results) {
    if(utils.isset(method, 'callback')) {
      async.eachSeries(
        method.callback,
        function(callback, next) {
          if(typeof(callback) == 'function') {
            callback(req, res, service, method, results, next);
          }
          else {
            var message = method.objectName + " have bad callback (not a function).";
            console.log(message.warn);
            next();
          }
        },
        function(err) {
          if(err) {
            console.log('Error : '.error, err);
          }
        }
      );
    }
  },

  // Run specific methode
  runMethod : function(method, callback) {
    var self   = services;
    var prefix = method.prefix || '';
    var suffix = method.suffix || '';
    // var path   = prefix + '/' + method.objectPluralName + suffix;

    var routes = [
      {
        path: prefix + '/' + method.objectPluralName + suffix,
        availableVerbs: {get: true, post: true, put: true, delete: true}
      },
      {
        path: prefix + '/' + method.objectPluralName + '/:id' + suffix,
        availableVerbs: {get: true, put: true, delete: true}
      },
      {
        path: prefix + '/' + method.objectPluralName + '/:id/:resource' + suffix,
        availableVerbs: {get: true, put: true, delete: true}
      },
    ];

    for(i in routes) {
      if(utils.isset(routes[i].availableVerbs, method.verb)) {
        var message = 'New route available (' + method.verb.toUpperCase() + '): ';
        var messageRoute = routes[i].path.toString();

        console.log(message.success + messageRoute.success.inverse);

        self.app[method.verb](routes[i].path, function (req, res) {
          // Preprocess
          self.preprocess(req, res, method, function() {
            // Process
            self.process(req, res, method, function(req, res, service, method, results) {
              // Callback
              self.callback(req, res, service, method, results);
            });
          });
        });
      }
    }

    callback();
  },

}

module.exports = services;
