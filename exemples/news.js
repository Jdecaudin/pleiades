module.exports = {
  name: 'news',
  plural: 'news',
  model: {
    fields: {
      id    : { type : "serial", key: true },
      title : { type: "text" },
      date  : { type: "number" },
      body  : { type: "text" },
      path  : { type: "text" },
    },
    hasMany: [
      {
        fieldName :'tags',
        targetObject: 'tag',
      },
    ],
  },
  methods : [
    {name : 'GET'},
    {name : 'POST'},
  ]
};
