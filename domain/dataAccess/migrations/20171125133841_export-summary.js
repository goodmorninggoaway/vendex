exports.up = function(knex) {
  return knex.schema.alterTable('exportActivity', function(table) {
    table.jsonb('summary');
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('exportActivity', function(table) {
    table.dropColumn('summary');
  });
};
