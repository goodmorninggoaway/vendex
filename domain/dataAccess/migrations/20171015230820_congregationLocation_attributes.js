exports.up = function(knex) {
  return knex.schema.table('congregationLocation', function(table) {
    table.specificType('attributes', 'text[]');
  });
};

exports.down = function(knex) {
  return knex.schema.table('congregationLocation', function(table) {
    table.dropColumn('attributes');
  });
};
