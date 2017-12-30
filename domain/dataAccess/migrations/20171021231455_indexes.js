exports.up = function(knex) {
  return Promise.all([
    knex.schema.alterTable('location', function(table) {
      table.index(['externalLocationId', 'externalSource']);
    }),
    knex.schema.alterTable('congregationLocation', function(table) {
      table.index(['congregationId', 'locationId', 'source']);
    }),
  ]);
};

exports.down = function(knex) {
  return Promise.all([
    knex.schema.alterTable('location', function(table) {
      table.dropIndex(['externalLocationId', 'externalSource']);
    }),
    knex.schema.alterTable('congregationLocation', function(table) {
      table.dropIndex(['congregationId', 'locationId', 'source']);
    }),
  ]);
};
