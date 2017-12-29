exports.up = function (knex) {
  return knex.schema.alterTable('exportActivity', function (table) {
    table.varchar('key');
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable('exportActivity', function (table) {
    table.dropColumn('key');
  });
};
