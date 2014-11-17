var utils = require('./utils.js');

var objectsHelper = {
  getObjects: function(dir, objects, callbackGet) {
    var self = this;

    utils.autoLoad(
      dir,
      'objects',
      function(path, file, callback) {
        var obj = require(path + "/" + file);
        objects.push(obj);

        callback();
      },
      callbackGet
    );
  },

  getObjectSearchURL: function(object) {
    // @TODO : dynamically get object root
    return "/" + object.plural;
  }
};

module.exports = objectsHelper;
