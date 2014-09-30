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
  exposeObjects: {
    active: true,
    path: '/objects/all',
  },
  importableObjects: {
    active: true,
    path: '/objects/import',
  }
};


pleiades(app, settings, function() {
  // All objects are loaded, start serveur
  app.listen(8000);
});

```

You have just to replace :
* your orm settings (based on [orm module](https://www.npmjs.org/package/orm))
* (optional) your objects directory
* (optional) your express listen port

Objects
-------

Each object file is a part of your model. An object is described by a JSON file :

* name : (string) the name of your object
* plural : (string) the plural format of your object's name
* model : (object)
> * fields : (objects) the list of your fields (excluding [one/many]ToMany fields) according to [orm module](https://www.npmjs.org/package/orm)
> * hasMany : (array) a list of [one/many]ToMany fields described by an object containing :
> > * fieldName : (string) the name of the field in this model
> > * targetObject : (string) the name of the targeted object
* methods : (array) array of (js) objects containing different ways to handle your data. Each one can have :
> * name : (sting)


Exemple of objects
------------------

/objects/tag.json :

```javascript
{
  name: 'tag',
  plural: 'tags',
  model: {
    fields: {
      id          : { type : "serial", key: true },
      title       : { type: "text" },
      description : { type: "text" }
    },
  },
  methods : [
    {name : 'GET'},
    {name : 'POST'},
    {name : 'PUT'},
    {name : 'DELETE'}
  ]
}

```

/objects/news.json :

```javascript
{
  name: 'news',
  plural: 'news',
  model: {
    fields: {
      id    : { type : "serial", key: true },
      title : { type: "text" },
      date  : { type: "number" },
      body  : { type: "text" }
    },
    hasMany: [
      {
        fieldName :'tags',
        targetObject: 'tag'
      },
    ],
  },
  methods : [
    {name : 'GET'},
    {name : 'POST'},
    {name : 'PUT'},
    {name : 'DELETE'}
  ]
}

```

/objects/page.json :

```javascript
{
  name: 'page',
  plural: 'pages',
  model: {
    fields: {
      id    : { type : "serial", key: true },
      title : { type: "text" },
      body  : { type: "text" }
    }
  },
  methods : [
    {name : 'GET'},
    {name : 'POST'},
    {name : 'PUT'},
    {name : 'DELETE'}
  ]
}

```
