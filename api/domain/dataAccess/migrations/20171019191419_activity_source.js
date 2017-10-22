exports.up = function (knex) {
  return knex.schema.table('exportActivity', function (table) {
    table.string('source');
  });
};

exports.down = function (knex) {
  return knex.schema.table('congregationLocation', function (table) {
    table.dropColumn('source');
  });
};
