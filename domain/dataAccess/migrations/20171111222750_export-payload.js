exports.up = function (knex) {
  return knex.schema.alterTable('exportActivity', function (table) {
    table.jsonb('payload');
    table.timestamp('timestamp');
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable('exportActivity', function (table) {
    table.dropColumn('timestamp');
    table.dropColumn('payload');
  });
};
