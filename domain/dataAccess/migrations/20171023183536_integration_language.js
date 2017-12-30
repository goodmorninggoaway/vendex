exports.up = function(knex) {
  return knex.schema.alterTable('congregationIntegration', function(table) {
    table.string('language');
    table.dropUnique(['destinationCongregationId', 'sourceCongregationId']);
    table.unique([
      'destinationCongregationId',
      'sourceCongregationId',
      'language',
    ]);
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('congregationIntegration', function(table) {
    table.dropUnique([
      'destinationCongregationId',
      'sourceCongregationId',
      'language',
    ]);
    table.dropColumn('language');
  });
};
