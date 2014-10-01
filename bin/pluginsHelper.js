var utils = require('./utils.js');

var pluginsHelper = {
  init: function(app, callback) {
    this.app = app;
    this.runPlugins(__dirname + '/plugins', callback);
  },

  runPlugins: function(pluginsPath, /*settings,*/ callbackPlugins) {
    var self = this;

    utils.autoLoad(
      pluginsPath,
      'plugins',
      function(path, file, callback) {
        var filename = file.split('.');
        filename.pop();
        filename = filename.join('.');
        if(self.isEnable(filename)) {
          require(path + '/' + file).run(self.app);

          console.log("Plugin " + filename + " run successfully");
        }

        callback();
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
