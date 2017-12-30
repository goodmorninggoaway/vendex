exports.up = function(knex) {
  return knex.schema.createTable('congregationIntegration', function(table) {
    table.bigIncrements('congregationIntegrationId');
    table.integer('destinationCongregationId').notNullable();
    table.integer('sourceCongregationId').notNullable();
    table
      .foreign('destinationCongregationId')
      .references('congregation.congregationId');
    table
      .foreign('sourceCongregationId')
      .references('congregation.congregationId');
    table.unique('destinationCongregationId', 'sourceCongregationId');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('congregationIntegration');
};
