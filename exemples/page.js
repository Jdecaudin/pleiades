module.exports = {
  name: 'page',
  plural: 'pages',
  model: {
    fields: {
      id    : { type : "serial", key: true },
      title : { type: "text" },
      body  : { type: "text" },
      path  : { type: "text" },
    },
  },
  methods : [
    {
      verb: 'get',
      preprocess: [pagePreprocessOne, pagePreprocessTwo],
      process: pageProcess,
      callback: [pageCallbackOne]
    },
    {verb: 'post'},
  ]
};

function pagePreprocessOne(req, res, next) {
  console.log('Hello ');
  req.helloWorld = 'World';

  next();
}

function pagePreprocessTwo(req, res, next) {
  console.log(req.helloWorld + ' :)');

  next();
}

function pageProcess(req, res, app, method, callback) {
  // Do anything here
  var results = ['array', 'of', 'results'];

  //!\ You must return something to the client here !
  res.send(results);

  callback(req, res, app, method, results);
}

function pageCallbackOne(req, res, app, method, results, next) {
  console.log("Super callback !", results);

  next();
}
