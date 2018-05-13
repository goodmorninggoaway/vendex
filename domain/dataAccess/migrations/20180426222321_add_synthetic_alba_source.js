exports.up = function(knex) {
  return knex.schema.alterTable('alba_location_import', function(table) {
    table.varchar('source', 128);
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('alba_location_import', function(table) {
    table.dropColumn('source', 128);
  });
};
