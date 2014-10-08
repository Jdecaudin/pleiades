pleiades
========

Installation
------------

```
npm install express orm pleiades
```

Usage
-----

/app.js :

```javascript
var app      = require('express')(),
    pleiades = require('pleiades');

var settings = {
  orm: "mysql://user:password@localhost/database",
  objectsFolder: __dirname + '/objects',
};

pleiades(app, settings, function() {
  // All objects are loaded, start serveur
  app.listen(8000);
});

```

You have just to replace :
* your orm settings (based on [orm module](https://www.npmjs.org/package/orm))
* the path to your objects directory

Write some objects to expose in your webservice (get some exemples in /exemples).

That's all !
