var utils = require('./utils.js');

var pluginsHelper = {
  init: function(app, callback) {
    this.app = app;
    app.pleiades.plugins = {};
    this.runPlugins(__dirname + '/plugins', callback);
  },

  runPlugins: function(pluginsPath, callbackPlugins) {
    var self = this;

    utils.autoLoad(
      pluginsPath,
      'plugins',
      function(path, file, callback) {
        var filename = file.split('.');
        filename.pop();
        filename = filename.join('.');
        if(self.isEnable(filename)) {
          require(path + '/' + file).run(self.app, function(plugin) {
            if(plugin) {
              self.app.pleiades.plugins[filename] = plugin;
            }
            var message = "Plugin " + filename + " run successfully";
            console.log(message.success);

            callback();
          });
        }
        else {
          callback();
        }
      },
      callbackPlugins
    );
  },

  isEnable: function(name) {
    var settings = this.app.pleiades.settings;

    return (
      utils.isset(settings, 'plugins.' + name + '.enable')
      && settings.plugins[name].enable === true
    );
  },
};

module.exports = pluginsHelper;
