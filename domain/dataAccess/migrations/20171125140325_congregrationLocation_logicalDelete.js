exports.up = function (knex) {
  return knex.schema.alterTable('congregationLocation', function (table) {
    table.boolean('deleted');
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable('congregationLocation', function (table) {
    table.dropColumn('deleted');
  });
};
