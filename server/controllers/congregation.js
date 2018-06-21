module.exports = {
  listCongregations: {
    async handler(req, res) {
      const { Congregation } = req.server.models();
      return await Congregation.query().orderBy('name');
    },
  },

  createCongregation: {
    async handler(req, res) {
      const { Congregation } = req.server.models();
      const { name, language } = req.payload;
      return Congregation.query().insert({ name, language });
    },
  },

  getCongregation: {
    async handler(req, res) {
      const { Congregation } = req.server.models();
      return Congregation.query().findById(req.params.congregationId);
    },
  },

  updateCongregation: {
    async handler(req, res) {
      const { Congregation } = req.server.models();
      const { congregationId } = req.params;
      const { name, language } = req.payload;

      return await Congregation.query()
        .skipUndefined()
        .patch({ name, language })
        .where({ congregationId });
    },
  },

  deleteCongregation: {
    async handler(req, res) {
      const { Congregation } = req.server.models();
      const { congregationId } = req.params;
      return Congregation.query()
        .skipUndefined()
        .del()
        .where({ congregationId });
    },
  },
};
