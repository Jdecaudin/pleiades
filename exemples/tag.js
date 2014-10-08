module.exports = {
  name: 'tag',
  plural: 'tags',
  model: {
    fields: {
      id          : { type : "serial", key: true },
      title       : { type: "text" },
      description : { type: "text" },
    },
  },
  methods : [
    {name : 'GET'},
    {name : 'POST'},
    {name : 'PUT'},
  ]
};
