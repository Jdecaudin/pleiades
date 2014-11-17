pleiades
========
---

[![NPM Version](https://img.shields.io/npm/v/pleiades.svg?style=flat)](https://www.npmjs.org/package/pleiades)
[![Build Status](https://img.shields.io/travis/strongloop/pleiades.svg?style=flat)](https://travis-ci.org/strongloop/pleiades)

---

Installation
------------

```
npm install express pleiades
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

Known issues
------------

* Deleting referenced objects (hasMany field) don't delete content on join table
* You have to restart your server two times after join table creation

@TODO
-----

* Tests
* UI (to manage objects, to manage contents)
* Be able to choose specific fields to get
* Documentation generation based on objects's description
* Content generation based on objects's description
* Implements HAL ?

... So help us ;-)

---

License
=======

---

This software is licensed under the MIT license.

Copyright (c) 2014 Julien Decaudin

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
