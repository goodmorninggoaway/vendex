exports.up = function (knex) {
  return knex.schema.alterTable('congregationIntegration', function (table) {
    table.dropUnique('destinationCongregationId', 'sourceCongregationId');
    table.unique(['destinationCongregationId', 'sourceCongregationId']);
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable('congregationIntegration', function (table) {
    table.dropUnique(['destinationCongregationId', 'sourceCongregationId']);
    table.unique('destinationCongregationId', 'sourceCongregationId');
  });
};
