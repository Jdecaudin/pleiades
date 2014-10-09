Objects
-------

Each object file is a part of your model. An object is described by a JSON file :

* name   : (string) the name of your object
* plural : (string) the plural format of your object's name
* model  : (object)
 * fields  : (objects) the list of your fields (excluding [one/many]ToMany fields) according to [orm module](https://www.npmjs.org/package/orm)
 * hasMany : (array) a list of [one/many]ToMany fields described by an object containing :
  * fieldName    : (string) the name of the field in this model
  * targetObject : (string) the name of the targeted object
* methods : (array) array of (js) objects containing different ways to handle your data. Each one can have :
 * verb       : (sting) the HTTP verb to use with the handler
 * preprocess : (optional - array) Array of functions triggered right after request reception. Each preprocess function
 * process    : (optional - function) Handler function replacing the default one (each verb have a default handler in : ./bin/defaultMethods/). This function must return the Express response object to client.

Preprocess functions
--------------------

Functions triggered right after request reception.
Each function take 3 parameters :
* req  : (object)   request object exposed by [Express](http://expressjs.com/api.html#request)
* res  : (object)   response object exposed by [Express](http://expressjs.com/api.html#response)
* next : (function) callback

Process functions
--------------------

Handler function replacing the default one (each verb have a default handler in : ./bin/defaultMethods/). This function must return the Express response object to client.
This function take 5 parameters :
* req      : (object) "request" object exposed by [Express](http://expressjs.com/api.html#request)
* res      : (object) "response" object exposed by [Express](http://expressjs.com/api.html#response)
* app      : (object) "app" object exposed by [Express](http://expressjs.com/api.html#application)
* method   : (object) current "method" object (described in your current pleiade object)
* callback : (function) callback
