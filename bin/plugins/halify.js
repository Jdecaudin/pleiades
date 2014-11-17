var _            = require('underscore');
var async        = require('async');
var halson       = require('halson');
var utils        = require('../utils.js'),
    objectHelper = require('../objectsHelper.js'),
    ormHelper    = require('../ormHelper.js');

var halify = {
  run: function(app, callback) {
    var self = this;

    self.halPathPrefix = '/hal';

    self.app      = app;
    self.objects  = _.indexBy(app.pleiades.objects, 'name');
    self.settings = app.pleiades.settings.plugins.halify;

    // Add homepage handler
    self._homePageGetHandler();

    self.createNewObectsMethods(function(err) {
      self.createNewObectsMethods(function(err) {
        callback(self);
      });
    });
  },

  createNewObectsMethods: function(callback) {
    var self     = this;
    var services = require('../services.js');

    // For each object
    async.each(
      self.app.pleiades.objects,
      function(object, nextObject) {
        var halObj = new objectParser(self, object.name, object);
        // If object supports HAL
        if(halObj.valid) {
          var methodsByVerbs = _.indexBy(object.methods, 'verb');

          // Add GET method
          if(typeof(methodsByVerbs.get) != 'undefined') {
            var method = {
              verb             : 'get',
              objectName       : object.name,
              objectPluralName : object.plural,
              prefix           : self.halPathPrefix,
              process          : self.halifyGetPocessor,
            };

            services.runMethod(method, nextObject);
          }
          else {
            var message = '"' + object.name + '" object supports HAL format but havn\'t any get method.';
            console.log(message.warn);

            nextObject();
          }
        }
        else {
          nextObject();
        }
      },
      function(err) {
        callback(err);
      }
    );
  },

  _homePageGetHandler: function() {
    var self = this;

    self.app.get(self.halPathPrefix, function(req, res) {
      var message = 'Access HAL homepage (' + req.url + ')';
      console.log(message.prompt);

      var hal = halson();
      hal.addLink('self', req.url);

      var curies = [];

      async.each(
        self.app.pleiades.objects,
        function(object, nextObject) {
          if(utils.isset(object, 'hal')) {
            var halObject = new objectParser(self, object.name, {});

            halObject.getObjectCuries(function(err, obj) {
              hal._links = _.extend(hal._links, halObject.getBaseObjectSearchLink());
              _.extend(curies, obj);

              nextObject();
            });
          }
          else {
            nextObject();
          }
        },
        function(err) {
          if(err) {
            console.log('Error when exporting objects as HAL links'.error, err);

            res.status(500);
            res.send(err);
          }
          else {
            hal._links.curies = _.uniq(curies);
            res.send(hal);
          }
        }
      )

    });
  },

  getHandler: function(req, method, results, list, callback) {
    var self   = this;
    var hal    = halson();
    var curies = [];

    hal.addLink('self', req.url);
    hal.addLink('curies', []);

    if(list === true) {
      async.each(
        results,
        function(result, nextResult) {
          var halObject = new objectParser(self, method.objectName, result);

          halObject.getObjectCuries(function(err, curie) {
            if(err) {
              return callback(err);
            }
            else {
              hal.addLink(halObject.getLinkName(curie, method.objectName), halObject.exportAsLink());
              _.extend(curies, curie);

              nextResult();
            }
          });
        },
        function(err) {
          if(err) {
            return callback(err);
          }
          else {
            hal._links.curies = _.uniq(curies);
            callback(null, hal);
          }
        }
      );
    }
    else {
      new objectParser(halify, method.objectName, results[0]).parse(function(err, results) {
        callback(err, results);
      });
    }
  },

  halifyGetPocessor: function(req, res, service, method, callback) {
    var message = 'Access ' + req.url;
    console.log(message.prompt);

    // Is a list of objects ?
    var list       = true;
    var object     = service.app.pleiades.objectsByName[method.objectName];
    var objectKey  = ormHelper.getObjectKey(object);

    // @TODO : remove headers options .... create URL Get parameters
    var parameters = ormHelper.getParametersFromHeaders(req);

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
              halify.getHandler(req, method, results, list, function(err, results) {
                if(err) {
                  console.log('Error when exporting objects as HAL links'.error, err);

                  res.status(500);
                  res.send(err);
                  callback(req, res, service, method, results);
                }
                else {
                  res.send(results);
                  callback(req, res, service, method, results);
                }
              });
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
  },
};

var objectParser = function(halify, objectType, object) {
  this.object           = object;
  this.objectType       = objectType;
  this.objectDefinition = halify.app.pleiades.objectsByName[objectType];
  this.halify           = halify;
  this.halObject        = halson(object);

  /**
   * Transform current object to HAL JSON object and store it in this.halObject
   */
  this.parse = function(callback) {
    var self = this;

    if(self.valid) {
      this.halObject.addLink('self', this.getSelfLink());

      if(utils.isset(self.halify.app.pleiades.objectsByName, self.objectType + '.model.hasMany')) {
        self.parseRelations(function(err, rels) {
          self.halObject._links = _.extend(self.halObject._links, rels);

          callback(err, self.halObject);
        });
      }
      else {
        callback(null, self.halObject);
      }
    }
    else {
      callback("HAL metadata undefied", []);
    }
  },

  /**
   * Check if base object has valid metadata
   * @return {Boolean}
   */
  this.isHalMetadataValid = function(log) {
    var log = (typeof(log) != 'undefined') ? log : true;
    var valid = utils.isset(this.objectDefinition, 'hal.fieldBinding.id');
             // && utils.isset(this.objectDefinition, 'hal.self');

    if(!valid && log) {
      var message = '"' + this.objectType + '" object don\'t supports HAL format.';
      console.log(message.warn);
    }

    return valid;
  }

  /**
   * @return {string} self link of current object
   */
  this.getSelfLink = function() {
    // var self    = this;
    var fieldId = this.objectDefinition.hal.fieldBinding.id;
    return this.halify.halPathPrefix + '/' + this.objectType + '/' + this.object[fieldId];
    // return this.objectDefinition.hal.self.replace('{id}', self.object[fieldId]);
  };

  /**
   * get all relations of current object and expose them as JSON HAL Links & curies
   */
  this.parseRelations = function(callback) {
    var self = this;
    var ret  = {};
    var j    = 0;

    var fields = self.objectDefinition.model.hasMany;

    async.each(
      fields,
      function (field, nextField) {
        var methode = 'get' + self.ucfirst(self.objectDefinition.model.hasMany[j].fieldName);

        // call field getter
        self.object[methode](function(err, results) {
          if(err) {
            return callback(err);
          }
          else {
            self.getObjectCuries(function(err, cur) {
              if(err) {
                return callback(err);
              }
              else {
                ret.curies = cur;

                var curieName = self.getLinkName(cur, field.targetObject);

                ret[curieName] = [];

                async.each(
                  results,
                  function(result, next) {
                    var obj = new objectParser(self.halify, field.targetObject, result);
                    // obj.getObjectCuries(function(err, curies) {
                      ret[curieName].push(obj.exportAsLink());
                      next();
                    // });
                  },
                  function(err) {
                    if(err) {
                      return callback(err);
                    }
                    else {
                      callback(null, ret);
                    }
                  }
                );

              }
            });
          }
        });
      },
      function(err) {
        if(err) {
          return callback(err);
        }
        else {
          callback(null, ret);
        }
      }
    );
  };

  /**
   * @param  {array}  curie : JSON HAL collection of curies definitions
   * @param  {string} name  : object name
   * @return {string}       : HAL curie name
   */
  this.getLinkName = function(curies, name) {
    var linkName  = (curies.length > 0) ? curies[0].name + ':' : '';
        linkName += name;

    return linkName;
  };

  /**
   * @return a JSON HAL collection of curies definitions for the current
   * base object
   */
  this.getObjectCuries = function(callback) {
    var self = this;

    var pleiades      = self.halify.app.pleiades;
    var definedCuries = pleiades.settings.plugins.halify.curies || {};

    if(utils.isset(pleiades.objectsByName[self.objectType], 'hal.curies')
    && _.isArray(pleiades.objectsByName[self.objectType].hal.curies)) {
      var curies = [];

      async.each(
        pleiades.objectsByName[self.objectType].hal.curies,
        function (curie, nextCurie) {
          if(utils.isset(definedCuries, curie)) {
            curies.push(definedCuries[curie]);
          }

          nextCurie();
        },
        function(err) {
          if(err) {
            return callback(err);
          }
          else {
            callback(null, curies);
          }
        }
      );
    }
    else {
      callback(null, []);
    }
  };

  /**
   * @return a JSON HAL link of current object or null
   */
  this.exportAsLink = function() {
    if(this.valid) {
      var self = this;
      var ret  = {};

      if(utils.isset(self.objectDefinition, 'hal.fieldBinding.id')) {
        ret.href = self.halify.halPathPrefix + '/' + self.objectDefinition.plural + '/';
        ret.href += self.object[self.objectDefinition.hal.fieldBinding.id];

        if(utils.isset(self.objectDefinition, 'hal.fieldBinding.title')) {
          ret.title = self.object[self.objectDefinition.hal.fieldBinding.title];
        }
      }

      return ret;
    }
    else {
      return null;
    }
  };

  /**
   * @return a JSON HAL link to current base object search
   * (ex: /news/ for "news" base object)
   */
  this.getBaseObjectSearchLink = function() {
    var link  = {};

    if(utils.isset(this.objectDefinition.hal, 'curies')
    && this.objectDefinition.hal.curies.length > 0) {
      var curie = this.objectDefinition.hal.curies[0] + ':';
    }
    else {
      var curie = '';
    }

    link[curie + this.objectDefinition.plural] = {href: this.halify.halPathPrefix + objectHelper.getObjectSearchURL(this.objectDefinition)};

    return link;
  };

  this.ucfirst = function(str) {
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
  };

  this.valid = this.isHalMetadataValid();

  return this;
};

module.exports = halify;
