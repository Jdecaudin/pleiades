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
