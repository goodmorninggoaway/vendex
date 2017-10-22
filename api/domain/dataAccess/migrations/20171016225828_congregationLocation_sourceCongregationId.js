exports.up = function (knex) {
  return knex.schema.table('congregationLocation', function (table) {
    table.integer('sourceCongregationId'); // TODO make this .notNullable()
    table.foreign('sourceCongregationId').references('congregation.congregationId');
    table.unique(['locationId', 'sourceCongregationId']);
  });
};

exports.down = function (knex) {
  return knex.schema.table('congregationLocation', function (table) {
    table.dropUnique(['locationId', 'sourceCongregationId']);
    table.dropForeign('sourceCongregationId');
    table.dropColumn('sourceCongregationId');
  });
};
