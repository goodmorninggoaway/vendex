module.exports = {
  listCongregations: {
    async handler(req) {
      try {
        const { Congregation } = req.server.models();
        const { congregationId } = req.auth.credentials;
        const congregations = await Congregation.query()
          .skipUndefined()
          .select('*');

        return congregations;
      } catch (ex) {
        console.log(ex);
        return Boom.badImplementation();
      }
    },
  },
}
