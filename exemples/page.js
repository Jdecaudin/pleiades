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
    {name : 'GET'},
  ]
};
