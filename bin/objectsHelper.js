var async = require('async'),
    fs    = require('fs');

var objectsHelper = {
  getObjects: function(dir, objects, callbackGet) {
    var self = this;

    fs.readdir(dir, function(err, files) {
      if(err != undefined) {
        console.log('Error, can\'t get object files', err);
      }
      else {
        async.each(
          files,
          function(file, callback) {
            fs.stat(dir + '/' + file, function (errStat, stats) {
              if (errStat) {
                console.log(errStat);
                return;
              }

              if (stats.isFile()) {
                var obj = require(dir + "/" + file);
                objects.push(obj);
                callback();
              }
              if (stats.isDirectory()) {
                self.getObjects(dir + "/" + file, objects, callback);
              }
            });
          },
          function(err) {
            if(err != undefined) {
              console.log('Error, can\'t get object files', err);
            }
            else {
              callbackGet();
            }
          }
        );
      }
    });
  },
};

module.exports = objectsHelper;
