var orm     = require('orm'),
    async   = require('async'),
    _       = require('underscore');

var ormHelper = {
  define: function(app, db, models, next) {
    this.app = app;
    app.pleiades.orm = {};

    var objects = app.pleiades.objects;
    var self    = this;

    var Sync = require("sql-ddl-sync").Sync({
      dialect : "mysql",
      driver  : db.driver,
      // debug   : function (text) {
      //     console.log("> %s", text);
      // }
    });

    app.pleiades.orm.models = models;
    app.pleiades.orm.Sync   = Sync;

    // For each object
    async.eachSeries(
      objects,
      // Create base fields
      function(object, callback) {
        ormHelper.createBaseFields(
          db,
          models,
          object,
          callback
        );
      },
      function(err) {
        if(err != undefined) {
          console.log('Error, can\'t create base fields'.error, err);
          next();
        }
        else {
          // For each object (again !)
          async.eachSeries(
            objects,
            // Create rel fields
            function(object, callback) {
              ormHelper.createRelFields(
                models,
                object,
                callback
                // function() {
                //   self.syncModels(function() {
                //     callback();
                //   })
              );
            },
            function(err) {
              if(err != undefined) {
                console.log('Error, can\'t create relations'.error, err);
              }
              else {
                console.log('Models created successfully'.success);
              }

              next();
            }
          );
        }
      }
    );
  },

  getObjectKey: function(object) {
    for(fieldName in object.model.fields) {
      if(object.model.fields[fieldName].type == 'serial')
        return fieldName;
    }

    return null;
  },

  syncModels: function() {

  },

  createBaseFields: function(db, models, object, callback) {
    var self = this;

    if(object.hasOwnProperty('model') && object.model.hasOwnProperty('fields')) {
      models[object.name] = db.define(
        object.name,
        object.model.fields,
        {
          methods: {
            getAllAssoc: function (callbackGetAllAssoc) {
              self.getAllAssoc(this, object, callbackGetAllAssoc);
            }
          }
        }
      );
      models[object.name].sync();

      self.app.pleiades.orm.Sync.defineCollection(
        object.name,
        object.model.fields
      );
    }

    callback();
  },

  createRelFields: function(models, object, callback) {
    if(object.hasOwnProperty('model')
    && object.model.hasOwnProperty('hasMany')) {
      // For each relations
      async.eachSeries(
        object.model.hasMany,
        // Create relation
        function(field, callback3) {
          if(field.hasOwnProperty('fieldName')
          && field.hasOwnProperty('targetObject')) {
            models[object.name].hasMany(
              field.fieldName,
              models[field.targetObject],
              {},
              {
                reverse: object.plural,
                // autoFetch: true
                autoFetch: false
              }
            );
          }
          callback3();
        },
        function(err) {
          if(err != undefined) {
            console.log('Error, hasMany'.error, err);
          }
          else {
            models[object.name].sync();
          }
        }
      );
    }
    callback();
  },

  /**
   * Create a complete document (with related objects) from an object
   * useless if model.field.autoFetch == 1
   */
  getAllAssoc: function(model, object, callback) {
    var self = this,
        j    = 0;

    if(object.model.hasOwnProperty('hasMany')) {
      // For each rel field
      async.eachSeries(
        object.model.hasMany,
        function (fields, callbackFields) {
          var methode = 'get' + self.ucfirst(object.model.hasMany[j].fieldName);

          // call field getter
          model[methode](function(err, results) {
            self[object.model.hasMany[j].fieldName] = [];
            for(a in results) {
              self[object.model.hasMany[j].fieldName].push(results[a]);
            }

            j++;
            callbackFields();
          });
        },
        function (errFields) {
          if(errFields) {
            console.log(errFields);
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

  getParametersFromHeaders: function(req) {
    var parameters = {
      options: req.headers.hasOwnProperty('x-options') ? JSON.parse(req.headers['x-options']) : {},
      fields:  req.headers.hasOwnProperty('x-fields') ? JSON.parse(req.headers['x-fields']) : {}
    };

    var comparisons = {
      '='          : 'eq',
      '<>'         : 'ne',
      '>'          : 'gt',
      '>='         : 'gte',
      '<'          : 'lt',
      '<='         : 'lte',
      'between'    : 'between',
      'not_between': 'not_between',
      'like'       : 'like',
      'not_like'   : 'not_like',
    };

    for(var fieldName in parameters.fields) {
      if(parameters.fields.hasOwnProperty(fieldName)
      && parameters.fields[fieldName].hasOwnProperty('compare')
      && comparisons.hasOwnProperty(parameters.fields[fieldName].compare.operation)) {
        if(typeof(parameters.fields[fieldName].compare.value) == 'string'
        || typeof(parameters.fields[fieldName].compare.value) == 'number') {
          parameters.fields[fieldName] =
            orm[comparisons[parameters.fields[fieldName].compare.operation]](
              parameters.fields[fieldName].compare.value
            );
        }
        else {
          parameters.fields[fieldName] =
            orm[comparisons[parameters.fields[fieldName].compare.operation]](
              parameters.fields[fieldName].compare.value[0],
              parameters.fields[fieldName].compare.value[1]
            );
        }
      }
    }

    return parameters;
  },

  getParametersFromURL: function(req) {

  },

  decodeBlob: function(results, callback) {
    var i = -1;
    async.eachSeries(
      results,
      function(result, callbackRes) {
        i++;
        _.each(
          result,
          function(value, key, list) {
            if(value instanceof Buffer) {
              results[i][key] = new Buffer(results[i][key]).toString();
            }
          }
        );

        callbackRes();
      },
      function(err) {
        if(err) {
          console.log("Error : ".error, err);
        }

        callback();
      }
    );
  },

  ucfirst: function (str) {
    //  discuss at: http://phpjs.org/functions/ucfirst/
    // original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // bugfixed by: Onno Marsman
    // improved by: Brett Zamir (http://brett-zamir.me)
    //   example 1: ucfirst('kevin van zonneveld');
    //   returns 1: 'Kevin van zonneveld'

    str += '';
    var f = str.charAt(0)
      .toUpperCase();
    return f + str.substr(1);
  },

};

module.exports = ormHelper;
