const DAL = require('../../../domain/dataAccess').DAL;

exports.homepage = {
  handler: async function (req, h) {
    const congregations = await DAL.getCongregations();
    return h.view('homepage.ejs', { congregations });
  },
};
