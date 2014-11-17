var async = require('async'),
    fs    = require('fs');

var utils = {
  autoLoad: function(path, flag, callbackFileLoaded, callbackAutoLoad) {
    var self = this;

    fs.readdir(path, function(err, files) {
      if(err != undefined) {
        var message = 'Error, can\'t auto load ' + flag + ' files';
        console.log(message.error, err);
      }
      else {
        if(files.length == 0) {
          var message = 'Warning, try to autoload empty ' + flag + ' directory (' + path + ')';
          console.log(message.warn);
          callbackAutoLoad();
        }
        else {
          async.each(
            files,
            function(file, callbackEach) {
              fs.stat(path + '/' + file, function (errStat, stats) {
                if (errStat) {
                  console.log('Error'.error, errStat);
                  return;
                }

                if (stats.isFile()) {
                  callbackFileLoaded(path, file, callbackEach);
                }
                else if (stats.isDirectory()) {
                  self.autoLoad(path + "/" + file, flag, callbackFileLoaded, callbackEach);
                }
              });
            },
            function(err) {
              if(err != undefined) {
                var message = 'Error, can\'t auto load ' + flag + ' files';
                console.log(message.error, err);
              }
              else {
                callbackAutoLoad();
              }
            }
          );
        }
      }
    });
  },

  isset: function(object, property, notNull) {
    var notNull  = notNull || true;
    var property = property.split('.');

    if(property.length <1) {
      return false;
    }
    else if(property.length == 1) {
      return (
        (object.hasOwnProperty(property[0]) || property[0] in object)
        && (notNull === false|| (notNull === true && typeof(property[0]) != 'undefined'))
        )
    }
    else {
      if(object.hasOwnProperty(property[0])) {
        var nested = object[property[0]];
        property.shift();

        return this.isset(nested, property.join('.'));
      }
      else {
        return false;
      }
    }
  },
};

module.exports = utils;
