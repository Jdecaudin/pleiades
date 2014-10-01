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
};

module.exports = objectsHelper;
