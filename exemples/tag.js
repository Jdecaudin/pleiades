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
    {verb : 'get'},
    {verb : 'post'},
    {verb : 'put'},
  ]
};
